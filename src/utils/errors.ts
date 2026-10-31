import axios from 'axios';

/**
 * Pulls a human-readable message out of an API response body. Handles plain
 * strings, `{ error }` / `{ message }` objects and ASP.NET ProblemDetails.
 * @param data The response body.
 * @returns The message, or null when none could be found.
 */
export const extractMessage = (data: unknown): string | null => {
  if (typeof data === 'string') {
    return data.trim() || null;
  }
  if (data && typeof data === 'object') {
    const body = data as Record<string, unknown>;
    for (const key of ['error', 'message', 'Message']) {
      if (typeof body[key] === 'string' && body[key]) {
        return body[key] as string;
      }
    }
    if (body.errors && typeof body.errors === 'object') {
      const first = Object.values(body.errors as Record<string, unknown>)
        .flat()
        .find(v => typeof v === 'string');
      if (typeof first === 'string') {
        return first;
      }
    }
    for (const key of ['detail', 'title']) {
      if (typeof body[key] === 'string' && body[key]) {
        return body[key] as string;
      }
    }
  }
  return null;
};

/**
 * Turns any thrown value (usually an Axios error) into a sentence suitable
 * for showing to the user.
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
    const detail = extractMessage(data);
    if (detail) {
      return detail;
    }
    if (status === 404) {
      return 'Not found.';
    }
    if (status >= 500) {
      return `The server returned an error (${status}).`;
    }
    return fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

/**
 * @param error The caught error.
 * @returns True when the error is an HTTP 404 from the API.
 */
export const isNotFound = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 404;
