import * as coda from "@codahq/packs-sdk";

/* -------------------------------------------------------------------------- */
/*                               Object Schemas                               */
/* -------------------------------------------------------------------------- */

export const LineItemSchema = coda.makeObjectSchema({
  name: "LineItem",
  type: coda.ValueType.Object,
  displayProperty: "summary",
  identityName: "LineItem",
  properties: {
    summary: { type: coda.ValueType.String },
    lineItemId: { type: coda.ValueType.Number, fromKey: "Id" },
    lineItemNumber: { type: coda.ValueType.Number, fromKey: "LineNum" },
    description: { type: coda.ValueType.String, fromKey: "Description" },
    quantity: { type: coda.ValueType.Number },
    unitPrice: {
      type: coda.ValueType.Number,
      codaType: coda.ValueHintType.Currency,
    },
    amount: {
      type: coda.ValueType.Number,
      codaType: coda.ValueHintType.Currency,
      fromKey: "Amount",
    },
    item: {
      type: coda.ValueType.Object,
      displayProperty: "name",
      properties: {
        name: { type: coda.ValueType.String },
        itemId: { type: coda.ValueType.Number },
      },
    },
    taxCode: { type: coda.ValueType.String },
  },
});

export const physicalAddressSchema = coda.makeObjectSchema({
  name: "PhysicalAddress",
  type: coda.ValueType.Object,
  displayProperty: "summary",
  identityName: "PhysicalAddress",
  properties: {
    summary: { type: coda.ValueType.String },
    line1: { type: coda.ValueType.String, fromKey: "Line1" },
    line2: { type: coda.ValueType.String, fromKey: "Line2" },
    line3: { type: coda.ValueType.String, fromKey: "Line3" },
    line4: { type: coda.ValueType.String, fromKey: "Line4" },
    line5: { type: coda.ValueType.String, fromKey: "Line5" },
    city: { type: coda.ValueType.String, fromKey: "City" },
    stateOrProvince: {
      type: coda.ValueType.String,
      fromKey: "CountrySubDivisionCode",
    },
    postalCode: { type: coda.ValueType.String, fromKey: "PostalCode" },
    country: { type: coda.ValueType.String, fromKey: "Country" },
  },
});

//         "Description": "Fountain Pump",
//         "DetailType": "SalesItemLineDetail",
//         "SalesItemLineDetail": {
//           "TaxCodeRef": {
//             "value": "TAX"
//           },
//           "Qty": 1,
//           "UnitPrice": 12.75,
//           "ItemRef": {
//             "name": "Pump",
//             "value": "11"
//           }
//         },
//         "LineNum": 2,
//         "Amount": 12.75,
//         "Id": "2"
//       },
//       {
//         "DetailType": "SubTotalLineDetail",
//         "Amount": 335.25,
//         "SubTotalLineDetail": {}
//       }

/* -------------------------------------------------------------------------- */
/*                              Reference Schemas                             */
/* -------------------------------------------------------------------------- */

const CustomerReferenceSchema = coda.makeObjectSchema({
  codaType: coda.ValueHintType.Reference,
  properties: {
    displayName: { type: coda.ValueType.String, required: true },
    customerId: { type: coda.ValueType.String, required: true },
  },
  displayProperty: "displayName",
  idProperty: "customerId",
  identity: {
    name: "Customer",
  },
});

/* -------------------------------------------------------------------------- */
/*                         Record / Sync Table Schemas                        */
/* -------------------------------------------------------------------------- */

export const CustomerSchema = coda.makeObjectSchema({
  type: coda.ValueType.Object,
  displayProperty: "displayName",
  idProperty: "customerId",
  identityName: "Customer",
  featuredProperties: ["email", "balance"],
  properties: {
    customerId: { type: coda.ValueType.String, required: true, fromKey: "Id" },
    displayName: {
      type: coda.ValueType.String,
      required: true,
      fromKey: "DisplayName",
    },
    balance: {
      type: coda.ValueType.Number,
      codaType: coda.ValueHintType.Currency,
      fromKey: "Balance",
    },
    taxable: { type: coda.ValueType.Boolean, fromKey: "Taxable" },
    active: { type: coda.ValueType.Boolean, fromKey: "Active" },
    companyName: { type: coda.ValueType.String, fromKey: "CompanyName" },
    firstName: { type: coda.ValueType.String, fromKey: "FirstName" },
    lastName: { type: coda.ValueType.String, fromKey: "LastName" },
    printOnCheckName: {
      type: coda.ValueType.String,
      fromKey: "PrintOnCheckName",
    },
    currency: { type: coda.ValueType.String },
    isAProject: { type: coda.ValueType.Boolean, fromKey: "IsProject" }, // TODO: Figure out what they mean by this
    isAJob: { type: coda.ValueType.Boolean, fromKey: "Job" },
    billWithParent: { type: coda.ValueType.Boolean, fromKey: "BillWithParent" },
    email: { type: coda.ValueType.String },
    phone: {
      type: coda.ValueType.String,
      fromKey: "PrimaryPhone.FreeFormNumber",
    },
    createdAt: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.DateTime,
    },
    modifiedAt: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.DateTime,
    },
    billingAddress: physicalAddressSchema, // Synthetic property we'll generate
    shippingAddress: physicalAddressSchema, // Synthetic property we'll generate
    preferredDeliveryMethod: {
      type: coda.ValueType.String,
      fromKey: "PreferredDeliveryMethod",
    },
    parentCustomer: CustomerReferenceSchema,
  },
});

export const InvoiceSchema = coda.makeObjectSchema({
  type: coda.ValueType.Object,
  displayProperty: "invoiceNumber",
  idProperty: "invoiceId",
  identityName: "Invoice",
  featuredProperties: [
    "customer",
    "invoiceDate",
    "dueDate",
    "totalAmount",
    "paid",
  ],
  properties: {
    invoiceId: { type: coda.ValueType.String, fromKey: "Id", required: true },
    invoiceNumber: {
      type: coda.ValueType.String,
      fromKey: "DocNumber",
      required: true,
    },
    invoiceDate: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.Date,
      fromKey: "TxnDate",
    },
    dueDate: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.Date,
      fromKey: "DueDate",
    },
    customer: CustomerReferenceSchema,
    totalAmount: {
      type: coda.ValueType.Number,
      codaType: coda.ValueHintType.Currency,
      fromKey: "TotalAmt",
    },
    balance: {
      type: coda.ValueType.Number,
      codaType: coda.ValueHintType.Currency,
      fromKey: "Balance",
    },
    depositAmount: {
      type: coda.ValueType.Number,
      codaType: coda.ValueHintType.Currency,
      fromKey: "Deposit",
    },
    paid: { type: coda.ValueType.Boolean }, // Synthetic property we'll generate
    pdf: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.Attachment,
    },
    lineItems: {
      type: coda.ValueType.Array,
      items: LineItemSchema,
    },
    subtotal: {
      type: coda.ValueType.Number,
      codaType: coda.ValueHintType.Currency,
    },
    tax: {
      type: coda.ValueType.Number,
      codaType: coda.ValueHintType.Currency,
    },
    customerMemo: { type: coda.ValueType.String },
    printStatus: { type: coda.ValueType.String, fromKey: "PrintStatus" },
    salesTerms: { type: coda.ValueType.String },
    billingEmail: { type: coda.ValueType.String },
    createdAt: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.DateTime,
    },
    modifiedAt: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.DateTime,
    },
    shippingAddress: physicalAddressSchema,
    billingAddress: physicalAddressSchema,
  },
});

export const InvoiceReferenceSchema = coda.makeReferenceSchemaFromObjectSchema(
  InvoiceSchema,
  "Invoice"
);

// Sample Invoice Response
// {
//   "Invoice": {
//     "TxnDate": "2014-09-19",
//     "domain": "QBO",
//     "PrintStatus": "NeedToPrint",
//     "SalesTermRef": {
//       "value": "3"
//     },
//     "TotalAmt": 362.07,
//     "Line": [
//       {
//         "Description": "Rock Fountain",
//         "DetailType": "SalesItemLineDetail",
//         "SalesItemLineDetail": {
//           "TaxCodeRef": {
//             "value": "TAX"
//           },
//           "Qty": 1,
//           "UnitPrice": 275,
//           "ItemRef": {
//             "name": "Rock Fountain",
//             "value": "5"
//           }
//         },
//         "LineNum": 1,
//         "Amount": 275.0,
//         "Id": "1"
//       },
//       {
//         "Description": "Fountain Pump",
//         "DetailType": "SalesItemLineDetail",
//         "SalesItemLineDetail": {
//           "TaxCodeRef": {
//             "value": "TAX"
//           },
//           "Qty": 1,
//           "UnitPrice": 12.75,
//           "ItemRef": {
//             "name": "Pump",
//             "value": "11"
//           }
//         },
//         "LineNum": 2,
//         "Amount": 12.75,
//         "Id": "2"
//       },
//       {
//         "Description": "Concrete for fountain installation",
//         "DetailType": "SalesItemLineDetail",
//         "SalesItemLineDetail": {
//           "TaxCodeRef": {
//             "value": "TAX"
//           },
//           "Qty": 5,
//           "UnitPrice": 9.5,
//           "ItemRef": {
//             "name": "Concrete",
//             "value": "3"
//           }
//         },
//         "LineNum": 3,
//         "Amount": 47.5,
//         "Id": "3"
//       },
//       {
//         "DetailType": "SubTotalLineDetail",
//         "Amount": 335.25,
//         "SubTotalLineDetail": {}
//       }
//     ],
//     "DueDate": "2014-10-19",
//     "ApplyTaxAfterDiscount": false,
//     "DocNumber": "1037",
//     "sparse": false,
//     "CustomerMemo": {
//       "value": "Thank you for your business and have a great day!"
//     },
//     "Deposit": 0,
//     "Balance": 362.07,
//     "CustomerRef": {
//       "name": "Sonnenschein Family Store",
//       "value": "24"
//     },
//     "TxnTaxDetail": {
//       "TxnTaxCodeRef": {
//         "value": "2"
//       },
//       "TotalTax": 26.82,
//       "TaxLine": [
//         {
//           "DetailType": "TaxLineDetail",
//           "Amount": 26.82,
//           "TaxLineDetail": {
//             "NetAmountTaxable": 335.25,
//             "TaxPercent": 8,
//             "TaxRateRef": {
//               "value": "3"
//             },
//             "PercentBased": true
//           }
//         }
//       ]
//     },
//     "SyncToken": "0",
//     "LinkedTxn": [
//       {
//         "TxnId": "100",
//         "TxnType": "Estimate"
//       }
//     ],
//     "BillEmail": {
//       "Address": "Familiystore@intuit.com"
//     },
//     "ShipAddr": {
//       "City": "Middlefield",
//       "Line1": "5647 Cypress Hill Ave.",
//       "PostalCode": "94303",
//       "Lat": "37.4238562",
//       "Long": "-122.1141681",
//       "CountrySubDivisionCode": "CA",
//       "Id": "25"
//     },
//     "EmailStatus": "NotSet",
//     "BillAddr": {
//       "Line4": "Middlefield, CA  94303",
//       "Line3": "5647 Cypress Hill Ave.",
//       "Line2": "Sonnenschein Family Store",
//       "Line1": "Russ Sonnenschein",
//       "Long": "-122.1141681",
//       "Lat": "37.4238562",
//       "Id": "95"
//     },
//     "MetaData": {
//       "CreateTime": "2014-09-19T13:16:17-07:00",
//       "LastUpdatedTime": "2014-09-19T13:16:17-07:00"
//     },
//     "CustomField": [
//       {
//         "DefinitionId": "1",
//         "StringValue": "102",
//         "Type": "StringType",
//         "Name": "Crew #"
//       }
//     ],
//     "Id": "130"
//   },
//   "time": "2015-07-24T10:48:27.082-07:00"
// }

// Sample Customer Response
// {
//   "Taxable": false,
//   "BillAddr": {
//       "Id": "21",
//       "Line1": "500 Red Rock Rd.",
//       "City": "Bayshore",
//       "CountrySubDivisionCode": "CA",
//       "PostalCode": "94326",
//       "Lat": "INVALID",
//       "Long": "INVALID"
//   },
//   "ShipAddr": {
//       "Id": "21",
//       "Line1": "500 Red Rock Rd.",
//       "City": "Bayshore",
//       "CountrySubDivisionCode": "CA",
//       "PostalCode": "94326",
//       "Lat": "INVALID",
//       "Long": "INVALID"
//   },
//   "Job": false,
//   "BillWithParent": false,
//   "Balance": 226.00,
//   "BalanceWithJobs": 226.00,
//   "CurrencyRef": {
//       "value": "USD",
//       "name": "United States Dollar"
//   },
//   "PreferredDeliveryMethod": "Print",
//   "IsProject": false,
//   "ClientEntityId": "0",
//   "domain": "QBO",
//   "sparse": false,
//   "Id": "20",
//   "SyncToken": "0",
//   "MetaData": {
//       "CreateTime": "2022-01-22T17:15:14-08:00",
//       "LastUpdatedTime": "2022-01-29T12:44:45-08:00"
//   },
//   "GivenName": "Stephanie",
//   "FamilyName": "Martini",
//   "FullyQualifiedName": "Red Rock Diner",
//   "CompanyName": "Red Rock Diner",
//   "DisplayName": "Red Rock Diner",
//   "PrintOnCheckName": "Red Rock Diner",
//   "Active": true,
//   "V4IDPseudonym": "0020985bbd0873d4eb4de8b999f92719063868",
//   "PrimaryPhone": {
//       "FreeFormNumber": "(650) 555-4973"
//   },
//   "PrimaryEmailAddr": {
//       "Address": "qbwebsamplecompany@yahoo.com"
//   }
// },
