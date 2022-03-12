import * as coda from "@codahq/packs-sdk";
import * as constants from "./constants";
import * as types from "./types";

export async function queryApi(
  context: coda.ExecutionContext,
  query: string,
  realmId?: string
) {
  realmId = constants.REALM_ID;
  let url = coda.withQueryParams(`${constants.BASE_URL}${realmId}/query`, {
    ...constants.QUERY_PARAMS,
    query: query,
  });
  const response = await context.fetcher.fetch({
    url: url,
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  return response.body.QueryResponse;
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
