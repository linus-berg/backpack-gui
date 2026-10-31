import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Artifact browser state stored in the URL, so a view can be shared as a
 * link (e.g. `/processor/npm?artifact=lodash`) and Back closes the inspector.
 *
 * - `q`: search text
 * - `all=1`: include dependencies (default is roots only)
 * - `deep=1`: search inside configuration values
 * - `artifact`: ID of the artifact open in the inspector
 */
export const useBrowserParams = () => {
  const [params, setParams] = useSearchParams();

  const update = useCallback(
    (changes: Record<string, string | null>, push = false) => {
      setParams(
        prev => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(changes)) {
            if (value === null || value === '') {
              next.delete(key);
            } else {
              next.set(key, value);
            }
          }
          return next;
        },
        { replace: !push },
      );
    },
    [setParams],
  );

  return {
    query: params.get('q') ?? '',
    onlyRoots: params.get('all') !== '1',
    deep: params.get('deep') === '1',
    inspectId: params.get('artifact'),
    setQuery: useCallback((q: string) => update({ q }), [update]),
    setOnlyRoots: useCallback(
      (onlyRoots: boolean) => update({ all: onlyRoots ? null : '1' }),
      [update],
    ),
    setDeep: useCallback(
      (deep: boolean) => update({ deep: deep ? '1' : null }),
      [update],
    ),
    /** Opens the inspector; pushes history so Back closes it again. */
    inspect: useCallback(
      (id: string) => update({ artifact: id }, true),
      [update],
    ),
    closeInspector: useCallback(() => update({ artifact: null }), [update]),
  };
};
