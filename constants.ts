// Sandbox URL:
export const BASE_URL = "https://sandbox-quickbooks.api.intuit.com/v3/company/";
// Production URL:
// export const BASE_URL = "https://quickbooks.api.intuit.com/v3/company/";

// Configuration & tuning for the pack
export const QUERY_PARAMS = { minorversion: 63 };
export const PAGE_SIZE = 10;

// A list of currency data from ISO 4217 currency data from
// https://github.com/ourworldincode/currency/blob/main/currencies.json
import * as currencies from "./currencies.json";
export const CURRENCIES = currencies;
