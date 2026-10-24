import { useEffect, useState } from 'react';
// Keep loader identity stable with useCallback at the caller.
export function useResource(loader, enabled = true) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ data: null, loading: enabled, error: null });
  useEffect(() => {
    let alive = true;
    if (!enabled) { setState({ data: null, loading: false, error: null }); return; }
    setState({ data: null, loading: true, error: null });
    Promise.resolve().then(loader).then(data => {
      if (alive) setState({ data, loading: false, error: null });
    }).catch(error => { if (alive) setState({ data: null, loading: false, error }); });
    return () => { alive = false; };
  }, [loader, enabled, attempt]);
  return { ...state, retry: () => setAttempt(value => value + 1) };
}
