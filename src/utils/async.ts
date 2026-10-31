/**
 * Runs `fn` over `items` with at most `limit` calls in flight, preserving
 * result order. Never rejects; inspect each settled result instead.
 * @param items Inputs to process.
 * @param limit Maximum number of concurrent calls.
 * @param fn Async worker for one item.
 * @param shouldStop Checked before starting each item; return true to skip
 * the remaining items (they settle as rejected with `CancelledError`).
 */
export const mapWithConcurrency = async <T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
  shouldStop: () => boolean = () => false,
): Promise<PromiseSettledResult<R>[]> => {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let next = 0;

  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      if (shouldStop()) {
        results[index] = { status: 'rejected', reason: new CancelledError() };
        continue;
      }
      try {
        results[index] = {
          status: 'fulfilled',
          value: await fn(items[index], index),
        };
      } catch (reason) {
        results[index] = { status: 'rejected', reason };
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
};

/** Marks work skipped because the user stopped a batch. */
export class CancelledError extends Error {
  constructor() {
    super('Cancelled');
    this.name = 'CancelledError';
  }
}
