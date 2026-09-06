const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

/**
 * A non-2xx response from the backend.
 *
 * The API always answers failures with the same envelope
 * ({timestamp, status, error, message, fieldErrors}), and `message` is written
 * to be shown to the user as-is — that is what AC8 needs for a rejected sale.
 */
export class ApiError extends Error {
  constructor(message, { status = 0, fieldErrors = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  /** 409: a domain rule was broken (no stock, deactivated customer, duplicate tax id). */
  get isConflict() {
    return this.status === 409;
  }

  /** 400: Bean Validation rejected the payload; `fieldErrors` says which fields. */
  get isValidation() {
    return this.status === 400;
  }

  /** The request never reached the backend. */
  get isOffline() {
    return this.status === 0;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      'Could not reach the server. Check that the backend is running on http://localhost:8080.',
      { status: 0 },
    );
  }

  // 204 and empty bodies are valid answers; don't try to parse them.
  const raw = await response.text();
  let payload = null;
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.message ?? `Request failed with status ${response.status}.`,
      { status: response.status, fieldErrors: payload?.fieldErrors ?? null },
    );
  }

  return payload;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
};
