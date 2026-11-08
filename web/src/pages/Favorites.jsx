import { useEffect, useState } from 'react';
import { api } from '../api';
import { useLibrary } from '../context/LibraryContext';
import ContentSection from '../components/ContentSection';

const FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'movie', label: 'Film' },
  { key: 'tv', label: 'Serial' },
  { key: 'music', label: 'Musik' },
];

export default function Favorites() {
  const { isFavorite, ready } = useLibrary();
  const [state, setState] = useState({ items: [], loading: true, error: '' });
  const [tick, setTick] = useState(0);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: '' }));

    api('/favorites')
      .then((d) => {
        if (cancelled) return;
        const items = d.favorites.map((f) => ({
          id: f.contentId,
          type: f.type,
          title: f.title,
          posterUrl: f.posterUrl,
        }));
        setState({ items, loading: false, error: '' });
      })
      .catch((err) => !cancelled && setState({ items: [], loading: false, error: err.message }));

    return () => {
      cancelled = true;
    };
  }, [tick]);

  // Hanya tampilkan yang masih berstatus favorit
  const visible = state.items.filter(
    (i) => isFavorite(i) && (filter === 'all' || i.type === filter)
  );

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Favorit saya</h1>
          <p className="muted">{ready && !state.loading ? `${visible.length} konten` : 'Memuat...'}</p>
        </div>
      </div>

      <div className="chips" role="tablist" aria-label="Filter favorit">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            role="tab"
            aria-selected={filter === f.key}
            className={`chip ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ContentSection
        layout="grid"
        items={visible}
        loading={state.loading || !ready}
        error={state.error}
        onRetry={() => setTick((t) => t + 1)}
        emptyText={
          filter === 'all'
            ? 'Belum ada favorit. Tekan ikon hati pada konten yang kamu suka.'
            : 'Belum ada favorit di kategori ini.'
        }
      />
    </>
  );
}