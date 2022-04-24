import * as coda from "@codahq/packs-sdk";
import * as constants from "./constants";
import * as helpers from "./helpers";

export async function syncCustomers(
  context: coda.SyncExecutionContext,
  realmId: string,
  activeOnly: boolean
) {
  let startPosition: number =
    (context.sync.continuation?.startPosition as number) || 1;
  // Generate a query to filter for active Customers, if requested (otherwise just leave blank)
  let activeOnlyQuery: string = activeOnly ? "where Status = Active " : "";
  let query = `select * from Customer startposition ${startPosition} ${activeOnlyQuery}maxresults ${constants.PAGE_SIZE}`;
  let response = await helpers.queryApi(context, realmId, query);
  let customers = response.Customer;

  // Massage the data into the sync table schema we've defined.
  for (let customer of customers) {
    customer.currency = customer.CurrencyRef?.value;
    customer.paymentMethod = customer.PaymentMethodRef?.value;
    customer.createdAt = customer.MetaData?.CreateTime;
    customer.updatedAt = customer.MetaData?.LastUpdatedTime;
    customer.email = customer.PrimaryEmailAddr?.Address;
    customer.phone = customer.PrimaryPhone?.FreeFormNumber;
    if (customer.BillAddr)
      customer.billingAddress = helpers.objectifyAddress(customer.BillAddr);
    if (customer.ShipAddr)
      customer.shippingAddress = helpers.objectifyAddress(customer.ShipAddr);
    if (customer.ParentRef)
      customer.parentCustomer = {
        customerId: customer.ParentRef.value,
        displayName: "Not found",
      };
  }

  // Start with a blank continuation.
  let nextContinuation = undefined;
  // If we have a full page of results, that means there might be more results
  // on the next page. Set the continuation so we can grab the next batch of
  // results, indicating which record to start from.
  if (customers?.length === constants.PAGE_SIZE) {
    nextContinuation = {
      startPosition: startPosition + constants.PAGE_SIZE,
    };
  }
  return {
    result: customers,
    continuation: nextContinuation,
  };
}

export async function syncInvoices(
  context: coda.SyncExecutionContext,
  realmId: string,
  dateRange: Date[]
) {
  let startPosition: number =
    (context.sync.continuation?.startPosition as number) || 1;
  let where = dateRange
    ? `TxnDate >= '${dateRange[0].toISOString()}' and TxnDate <= '${dateRange[1].toISOString()}'`
    : null;
  let query = helpers.buildQuery(`select * from Invoice`, startPosition, where);

  // get the invoices, as well as the currency preferences for the company
  let [invoiceResponse, preferences] = await Promise.all([
    helpers.queryApi(context, realmId, query),
    helpers.getApiEndpoint(context, realmId, "preferences"),
  ]);
  let invoices = invoiceResponse.Invoice;

  // get the PDF versions of each invoice
  const pdfs = await Promise.all(
    invoices.map((invoice) => getInvoicePDF(context, invoice.Id, realmId))
  );
  invoices.forEach((invoice, index) => {
    invoice.pdf = pdfs[index];
  });

  // Set up currency (fall back to USD if none detected)
  let currencyCode =
    preferences.Preferences?.CurrencyPrefs?.HomeCurrency?.value || "USD";
  let currency = constants.CURRENCIES[currencyCode];

  // Massage the data into the sync table schema we've defined.
  for (let invoice of invoices) {
    invoice.billingEmail = invoice.BillEmail?.Address;
    invoice.createdAt = invoice.MetaData?.CreateTime;
    invoice.updatedAt = invoice.MetaData?.LastUpdatedTime;
    invoice.customerMemo = invoice.CustomerMemo?.value;
    if (invoice.ShipAddr)
      invoice.shippingAddress = helpers.objectifyAddress(invoice.ShipAddr);
    if (invoice.BillAddr)
      invoice.billingAddress = helpers.objectifyAddress(invoice.BillAddr);
    invoice.tax = invoice.TxnTaxDetail?.TotalTax;
    // An invoice is considered paid if it has a non-zero total amount
    // (i.e. it's not just a blank invoice), and the balance is zero.
    invoice.paid = invoice.TotalAmt > 0 && (invoice.Balance as number) === 0;
    // Find subtotal
    invoice.subtotal = invoice.Line?.filter(
      (line) => line.DetailType === "SubTotalLineDetail"
    )?.reduce((accumulator, line) => accumulator + line.Amount, 0);
    // Associate to customer
    invoice.customer = {
      customerId: invoice.CustomerRef.value,
      displayName: invoice.CustomerRef.name,
    };
    // Get invoice currency, if there is one. If not, fall back to company currency
    let invoiceCurrency = invoice.CurrencyRef
      ? constants.CURRENCIES[invoice.CurrencyRef.value]
      : currency;
    // Format line items
    invoice.lineItems = [];
    for (let lineItem of invoice.Line) {
      // only add it if it's a sales line item (not a subtotal, group or discount line)
      if (lineItem.DetailType === "SalesItemLineDetail") {
        // generate a nice summary that we'll use as the display value
        lineItem.summary =
          lineItem.SalesItemLineDetail?.Qty +
          "x " +
          lineItem.Description +
          ": " +
          (invoiceCurrency ? invoiceCurrency.symbol : "") +
          lineItem.Amount.toFixed(invoiceCurrency?.decimals || 2);
        lineItem.quantity = lineItem.SalesItemLineDetail?.Qty;
        lineItem.unitPrice = lineItem.SalesItemLineDetail?.UnitPrice;
        lineItem.item = {
          name: lineItem.SalesItemLineDetail?.ItemRef?.name,
          itemId: lineItem.SalesItemLineDetail?.ItemRef?.value,
        };
        invoice.lineItems.push(lineItem);
      }
    }
  }
  let nextContinuation = undefined;
  if (invoices?.length === constants.PAGE_SIZE) {
    nextContinuation = {
      startPosition: startPosition + constants.PAGE_SIZE,
    };
  }
  return {
    result: invoices,
    continuation: nextContinuation,
  };
}

export async function getInvoicePDF(
  context: coda.ExecutionContext,
  invoiceId: string,
  realmId: string
) {
  let url = coda.withQueryParams(
    `${constants.BASE_URL}${realmId}/invoice/${invoiceId}/pdf`,
    { ...constants.QUERY_PARAMS }
  );
  const response = await context.fetcher.fetch({
    url: url,
    method: "GET",
    isBinaryResponse: true, // prevents Coda from trying to parse the response, returning a buffer instead
  });
  let temporaryFileUrl = await context.temporaryBlobStorage.storeBlob(
    response.body, // response.body is a buffer
    "application/pdf"
  );
  // Note that there's also a simpler way to do this, if we didn't need to specify the "application/pdf"
  // content type. We could skip the whole context.fetcher.fetch and just blob store the URL
  // directly (this storeUrl() method stil includes the auth headers, like fetcher.fetch()):
  // let temporaryFileUrl = await context.temporaryBlobStorage.storeUrl(url);
  return temporaryFileUrl;
}
