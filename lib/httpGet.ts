import fetch from "isomorphic-unfetch";

/**
 * Helper function to make API calls and testing pages easier
 * @param url: absolute url of the endpoint to call
 */
export default async function httpGet<T>(url: string): Promise<T> {
  const res = await fetch(url);

  // only network errors are thrown by fetch so I throw others manually
  if (Math.trunc(res.status / 100) !== 2) {
    return Promise.reject(`${res.status}: ${res.statusText}`);
  }

  return res.json();
}
