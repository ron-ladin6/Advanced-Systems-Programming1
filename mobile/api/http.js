import { API_BASE } from "./config";

//handles headers, JSON parsing, and basic error checking automatically.
async function request(path, { method = "GET", token, body } = {}) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  //if a token is provided, add it to the headers for authentication
  if (token) 
        headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  // Try to parse the response as JSON.
  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }
  //if the request failed, throw an error
  if (!res.ok) {
    const msg =
      (data && data.message) ||
      (typeof data === "string" ? data : null) ||
      `request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}
// export simplified functions for GET, POST, PATCH, DELETE
export const http = {
    get: (path, opts = {}) => request(path, { ...opts, method: "GET" }),
    post: (path, body, opts = {}) => request(path, { ...opts, method: "POST", body }),
    patch: (path, body, opts = {}) => request(path, { ...opts, method: "PATCH", body }),
    del: (path, opts = {}) => request(path, { ...opts, method: "DELETE" }),
};
