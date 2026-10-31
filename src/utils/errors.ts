import axios from 'axios';

/** Longest server message shown to users; longer text is cut off. */
const MAX_MESSAGE_LENGTH = 300;

/**
 * True when text is a diagnostic dump rather than a message meant for users:
 * an HTML error page, an exception with a stack trace, or echoed request
 * headers (which can contain the user's bearer token).
 */
const looksLikeDiagnostics = (text: string): boolean =>
  /^\s*</.test(text) ||
  /^\s*at\s+\S+/m.test(text) ||
  /\b\w+(\.\w+)*Exception\b:/.test(text) ||
  /^\s*HEADERS\s*$/m.test(text) ||
  /\bAuthorization\s*:/i.test(text) ||
  /\bBearer\s+[\w-]+\.[\w-]+/.test(text);

/**
 * Makes server-provided text safe to display: never diagnostics, only the
 * first line, and at most {@link MAX_MESSAGE_LENGTH} characters.
 * @param text Text from a response body.
 * @returns The message, or null when the text shouldn't be shown.
 */
export const sanitizeServerMessage = (text: string): string | null => {
  const trimmed = text.trim();
  if (!trimmed || looksLikeDiagnostics(trimmed)) {
    return null;
  }
  const firstLine = trimmed.split(/\r?\n/)[0].trim();
  return firstLine.length > MAX_MESSAGE_LENGTH
    ? `${firstLine.slice(0, MAX_MESSAGE_LENGTH - 1)}…`
    : firstLine;
};

/**
 * Pulls a human-readable message out of an API response body. Handles plain
 * strings, `{ error }` / `{ message }` objects and ASP.NET ProblemDetails.
 * Everything returned has gone through {@link sanitizeServerMessage}.
 * @param data The response body.
 * @returns The message, or null when none could be found.
 */
export const extractMessage = (data: unknown): string | null => {
  if (typeof data === 'string') {
    return sanitizeServerMessage(data);
  }
  if (data && typeof data === 'object') {
    const body = data as Record<string, unknown>;
    const candidates: unknown[] = [body.error, body.message, body.Message];
    if (body.errors && typeof body.errors === 'object') {
      candidates.push(
        ...Object.values(body.errors as Record<string, unknown>).flat(),
      );
    }
    candidates.push(body.detail, body.title);
    for (const candidate of candidates) {
      if (typeof candidate === 'string') {
        const message = sanitizeServerMessage(candidate);
        if (message) {
          return message;
        }
      }
    }
  }
  return null;
};

/**
 * @param data A response body.
 * @returns The ASP.NET `traceId` of a ProblemDetails body, if present. It
 * identifies the request in the API's logs.
 */
const extractTraceId = (data: unknown): string | null => {
  if (data && typeof data === 'object') {
    const traceId = (data as Record<string, unknown>).traceId;
    if (typeof traceId === 'string' && /^[\w-]{1,128}$/.test(traceId)) {
      return traceId;
    }
  }
  return null;
};

/**
 * Turns any thrown value (usually an Axios error) into a sentence suitable
 * for showing to the user. Server errors (5xx) never show the response body,
 * which can contain internal details; they show a reference instead.
 * @param error The caught error.
 * @param fallback Message used when nothing more specific is available.
 * @returns A display string; never empty.
 */
export const getErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong.',
): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Could not reach the Backpack API. Check your connection and try again.';
    }
    const { status, data } = error.response;
    if (status === 401) {
      return 'Your session has expired. Reload the page to sign in again.';
    }
    if (status === 403) {
      return "You don't have permission to do that.";
    }
    if (status >= 500) {
      const traceId = extractTraceId(data);
      return `The server hit an unexpected error (${status}).${
        traceId ? ` Reference: ${traceId}` : ''
      }`;
    }
    const detail = extractMessage(data);
    if (detail) {
      return detail;
    }
    if (status === 404) {
      return 'Not found.';
    }
    return fallback;
  }
  if (error instanceof Error && error.message) {
    return sanitizeServerMessage(error.message) ?? fallback;
  }
  return fallback;
};

/**
 * @param error The caught error.
 * @returns True when the error is an HTTP 404 from the API.
 */
export const isNotFound = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 404;
