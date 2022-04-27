// Sandbox URL:
// export const BASE_URL = "https://sandbox-quickbooks.api.intuit.com/v3/company/";
// Production URL:
export const BASE_URL = "https://quickbooks.api.intuit.com/v3/company/";

// Configuration & tuning for the pack
export const QUERY_PARAMS = { minorversion: 63 };
// Max page size supported by QBO is 1000. 200 seems ok for simpler requests that do
// not then require hitting the server again for each record (for those, e.g. invoice
// PDFs, we specify a more conservative page size inline)
export const PAGE_SIZE = 200;

// A list of currency data from ISO 4217 currency data from
// https://github.com/ourworldincode/currency/blob/main/currencies.json
import * as currencies from "./currencies.json";
export const CURRENCIES = currencies;
