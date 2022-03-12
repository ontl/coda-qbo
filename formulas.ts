import * as coda from "@codahq/packs-sdk";
import * as constants from "./constants";
import * as helpers from "./helpers";

export async function syncCustomers(context: coda.SyncExecutionContext) {
  let startPosition: number =
    (context.sync.continuation?.startPosition as number) || 1;
  let query = `select * from Customer startposition ${startPosition} maxresults ${constants.PAGE_SIZE}`;
  let response = await helpers.queryApi(context, query);
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

export async function syncInvoices(context: coda.SyncExecutionContext) {
  let startPosition: number =
    (context.sync.continuation?.startPosition as number) || 1;
  let query = `select * from Invoice startposition ${startPosition} maxresults ${constants.PAGE_SIZE}`;
  let response = await helpers.queryApi(context, query);
  let invoices = response.Invoice;

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
    // Find subtotal
    // TODO: Make sure this is safe; if there can be multiple subtotals this will be wrong
    invoice.subtotal = invoice.Line?.find(
      (line) => line.DetailType === "SubTotalLineDetail"
    )?.Amount;
    // Associate to customer
    invoice.customer = {
      customerId: invoice.CustomerRef.value,
      displayName: invoice.CustomerRef.name,
    };
    // Format line items
    invoice.lineItems = [];
    for (let lineItem of invoice.Line) {
      // only add it if it's a sales line item (not a subtotal line)
      if (lineItem.DetailType === "SalesItemLineDetail") {
        lineItem.summary = `${lineItem.SalesItemLineDetail?.Qty}x ${lineItem.Description}: ${lineItem.Amount}`;
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
