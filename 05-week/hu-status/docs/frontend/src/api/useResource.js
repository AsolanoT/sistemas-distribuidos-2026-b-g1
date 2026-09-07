import { useCallback, useEffect, useState } from 'react';

/**
 * Loads data from the API and re-loads on demand.
 *
 * `loader` must be memoised by the caller (useCallback), because it is what
 * decides when a reload happens. Every list screen refreshes through `reload`
 * after a write, so what is on screen always came back from the server.
 */
export function useResource(loader) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const result = await loader();
      setData(result);
      setError(null);
    } catch (caught) {
      setError(caught);
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const result = await loader();
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (caught) {
        if (!cancelled) setError(caught);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loader]);

  return { data, error, loading, reload };
}
