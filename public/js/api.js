// api.js — centralised fetch wrapper
// All API calls go through apiFetch() so the JWT token is always attached.

const API_BASE = '';  // same origin — Express serves both static + API

/**
 * Wrapper around fetch that:
 *  1. Prepends API_BASE to every path
 *  2. Sets Content-Type: application/json for non-GET requests
 *  3. Attaches the stored JWT as Authorization: Bearer <token>
 *  4. Parses the JSON response
 *  5. Throws an Error with the server's error message on non-2xx status
 *
 * @param {string} path   e.g. '/api/teams'
 * @param {object} options  same options object as native fetch()
 * @returns {Promise<any>}  parsed JSON body
 */
async function apiFetch(path, options = {}) {
  const headers = { ...options.headers };

  // attach content-type for requests that send a body
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  // attach JWT if one is stored
  const token = sessionGetToken();
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  const res = await fetch(API_BASE + path, { ...options, headers });

  // parse body (even on error, the server sends JSON)
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    // use the server's human-readable message if available
    const msg =
      (data && data.error && data.error.message) ||
      (data && data.message) ||
      `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return data;
}
