import { useCallback, useEffect, useState } from 'react';
import { loadList } from '../services/content';

// Mengambil daftar konten. path = null artinya tidak mengambil apa pun.
export default function useList(path) {
  const [state, setState] = useState({ items: [], loading: true, error: '' });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) {
      setState({ items: [], loading: false, error: '' });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: '' }));

    loadList(path)
      .then((items) => !cancelled && setState({ items, loading: false, error: '' }))
      .catch((err) => !cancelled && setState({ items: [], loading: false, error: err.message }));

    return () => {
      cancelled = true;
    };
  }, [path, tick]);

  const retry = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, retry };
}