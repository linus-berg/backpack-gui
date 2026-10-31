import { useEffect, useState } from 'react';

/**
 * Returns `value` once it has stopped changing for `delay` milliseconds.
 * @param value The fast-changing value (e.g. a search input).
 * @param delay Debounce window in milliseconds.
 */
export const useDebouncedValue = <T>(value: T, delay = 250): T => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};
