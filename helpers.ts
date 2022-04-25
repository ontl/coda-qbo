import * as coda from "@codahq/packs-sdk";
import * as constants from "./constants";
import * as types from "./types";

export async function queryApi(
  context: coda.ExecutionContext,
  realmId: string,
  query: string
) {
  let url = coda.withQueryParams(`${constants.BASE_URL}${realmId}/query`, {
    ...constants.QUERY_PARAMS,
    query: query,
  });
  const response = await context.fetcher.fetch({
    url: url,
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return response.body.QueryResponse;
}

export function buildQuery(
  baseQuery: string,
  startPosition: number,
  where?: string, // WITHOUT the word "where"
  maxResults: number = constants.PAGE_SIZE
) {
  let whereElement = where ? `where ${where} ` : "";
  return `${baseQuery} ${whereElement}startposition ${startPosition} maxresults ${maxResults}`;
}

export async function getApiEndpoint(
  context: coda.ExecutionContext,
  realmId: string,
  endpoint: string
) {
  let url = coda.withQueryParams(
    `${constants.BASE_URL}${realmId}/${endpoint}`,
    { ...constants.QUERY_PARAMS }
  );
  const response = await context.fetcher.fetch({
    url: url,
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return response.body;
}

export function concatenateAddress(address: types.addressApiResponse) {
  let addressString = "";
  if (address.Line1) addressString += address.Line1;
  if (address.Line2) addressString += ` ${address.Line2}`;
  if (address.Line3) addressString += ` ${address.Line3}`;
  if (address.Line4) addressString += ` ${address.Line4}`;
  if (address.Line5) addressString += ` ${address.Line5}`;
  if (address.City) addressString += `, ${address.City}`;
  if (address.CountrySubDivisionCode)
    addressString += `, ${address.CountrySubDivisionCode}`;
  if (address.PostalCode) addressString += ` ${address.PostalCode}`;
  return addressString;
}

export function objectifyAddress(address: types.addressApiResponse) {
  return {
    ...address,
    summary: concatenateAddress(address),
  };
}

export function dateRangeIsValid(dateRange: Date[]) {
  // The main purpose of this function is that when users choose "Everything" in the date range
  // selector, Coda sends a range from year 0000 to year 4000. QBO chokes on these dates, throwing
  // a 400 error. We use this function to flag if dates are outside a reasonable range of 1900-2100.
  if (
    !dateRange ||
    dateRange.length !== 2 ||
    dateRange[0].getFullYear() < 1900 ||
    dateRange[1].getFullYear() > 2100
  )
    return false;
  return true;
}
