import * as coda from "@codahq/packs-sdk";
import * as constants from "./constants";
import * as helpers from "./helpers";
import * as formulas from "./formulas";
import * as schemas from "./schemas";

export const pack = coda.newPack();
pack.addNetworkDomain("intuit.com");
pack.setUserAuthentication({
  type: coda.AuthenticationType.OAuth2,
  authorizationUrl:
    "https://appcenter.intuit.com/connect/oauth2?state='just-a-random-string-to-satisfy-CLI'",
  tokenUrl: "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
  scopes: ["com.intuit.quickbooks.accounting"],
  // This doesn't actually return a full endpoint URL, but it contains the realmId (a unique ID
  // identifying the users's company on QuickBooks Online), which we'll need to build the request URLs.
  // endpointKey: "realmId",
  // requiresEndpointUrl: true,
});

pack.addSyncTable({
  name: "Customers",
  identityName: "Customer",
  description: "All of your QBO Customers (including Jobs)",
  schema: schemas.CustomerSchema,
  formula: {
    name: "SyncCustomers",
    description: "Sync all Customers (including Jobs)",
    parameters: [],
    execute: async function ([], context) {
      return formulas.syncCustomers(context);
    },
  },
});

pack.addSyncTable({
  name: "Invoices",
  identityName: "Invoice",
  description: "All of your QBO Invoices",
  schema: schemas.InvoiceSchema,
  formula: {
    name: "SyncInvoices",
    description: "Sync all Invoices",
    parameters: [],
    execute: async function ([], context) {
      return formulas.syncInvoices(context);
    },
  },
});

// pack.addFormula({
//   name: "InvoicePDF",
//   description: "Download a PDF of an Invoice",
//   parameters: [
//     coda.makeParameter({
//       name: "InvoiceId",
//       type: coda.ParameterType.String,
//       description: "The ID of the Invoice to download",
//     }),
//     coda.makeParameter({
//       name: "realmId",
//       type: coda.ParameterType.String,
//       description: "Your QuickBooks Online company ID (only needed in beta)",
//       optional: true,
//     }),
//   ],
//   resultType: coda.ValueType.String,
//   codaType: coda.ValueHintType.Attachment,
//   execute: async function (["invoiceId", "realmId"], context) {

//   },
// })
