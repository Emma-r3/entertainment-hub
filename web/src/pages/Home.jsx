import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useList from '../hooks/useList';
import ContentSection from '../components/ContentSection';

const TABS = [
  { key: 'movie', label: 'Film' },
  { key: 'tv', label: 'Serial' },
  { key: 'music', label: 'Musik' },
];
const FILTERS = [{ key: 'all', label: 'Semua' }, ...TABS];

export default function Home() {
  const { user } = useAuth();
  const [type, setType] = useState('movie');
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  // Tunggu 0,5 detik setelah berhenti mengetik
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 500);
    return () => clearTimeout(t);
  }, [query]);

  const searching = debounced.length > 0;

  const fresh = useList(searching ? null : `/content/new/${type}`);
  const trending = useList(searching ? null : `/content/trending/${type}`);
  const results = useList(
    searching ? `/content/search?q=${encodeURIComponent(debounced)}&type=${filter}` : null
  );

  const chips = searching ? FILTERS : TABS;
  const activeChip = searching ? filter : type;
  const selectChip = searching ? setFilter : setType;

  return (
    <>
      <section className="home-hero">
        <h1>{user ? `Halo, ${user.name}` : 'Temukan hiburan favoritmu'}</h1>
        <p className="muted">Film, serial TV, dan musik dalam satu daftar.</p>

        <div className="input-wrap search-box">
          <Search size={20} color="var(--text-2)" />
          <input
            type="search"
            placeholder="Cari film, serial, atau lagu..."
            aria-label="Cari konten"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="icon-btn" onClick={() => setQuery('')} aria-label="Hapus pencarian">
              <X size={18} />
            </button>
          )}
        </div>
      </section>

      <div className="chips" role="tablist" aria-label={searching ? 'Filter hasil' : 'Kategori'}>
        {chips.map((c) => (
          <button
            key={c.key}
            role="tab"
            aria-selected={activeChip === c.key}
            className={`chip ${activeChip === c.key ? 'active' : ''}`}
            onClick={() => selectChip(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {searching ? (
        <ContentSection
          title={`Hasil untuk "${debounced}"`}
          layout="grid"
          items={results.items}
          loading={results.loading}
          error={results.error}
          onRetry={results.retry}
          emptyText={`Tidak ada hasil untuk "${debounced}".`}
        />
      ) : (
        <>
          <ContentSection
            title="New Release"
            items={fresh.items}
            loading={fresh.loading}
            error={fresh.error}
            onRetry={fresh.retry}
            emptyText="Belum ada rilisan terbaru."
          />
          <ContentSection
            title="Trending"
            items={trending.items}
            loading={trending.loading}
            error={trending.error}
            onRetry={trending.retry}
            emptyText="Belum ada konten trending."
          />
        </>
      )}
    </>
  );
}