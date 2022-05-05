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
});

pack.addSyncTable({
  name: "Customers",
  identityName: "Customer",
  description: "All of your QBO Customers (including Jobs)",
  schema: schemas.CustomerSchema,
  formula: {
    name: "SyncCustomers",
    description: "Sync all Customers (including Jobs)",
    parameters: [
      coda.makeParameter({
        name: "CompanyId",
        description: "Your company ID on QuickBooks",
        type: coda.ParameterType.String,
      }),
      coda.makeParameter({
        name: "ActiveOnly",
        description: "Only sync active Customers",
        type: coda.ParameterType.Boolean,
        optional: true,
      }),
    ],
    execute: async function ([CompanyId, ActiveOnly], context) {
      return formulas.syncCustomers(context, CompanyId, ActiveOnly);
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
    parameters: [
      coda.makeParameter({
        name: "CompanyId",
        description: "Your company ID on QuickBooks",
        type: coda.ParameterType.String,
      }),
      coda.makeParameter({
        name: "DateRange",
        description: "Only sync Invoices dated within this range",
        type: coda.ParameterType.DateArray,
      }),
      coda.makeParameter({
        name: "IncludePdfs",
        description: "Include PDFs of each invoices (makes sync slower)",
        type: coda.ParameterType.Boolean,
        optional: true,
      }),
    ],
    execute: async function ([CompanyId, DateRange, IncludePdfs], context) {
      return formulas.syncInvoices(context, CompanyId, DateRange, IncludePdfs);
    },
  },
});
