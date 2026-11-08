import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { api } from '../api';
import { useLibrary } from '../context/LibraryContext';
import CollectionForm from '../components/CollectionForm';

export default function Collections() {
  const { notify } = useLibrary();
  const [state, setState] = useState({ collections: [], loading: true, error: '' });
  const [tick, setTick] = useState(0);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: '' }));

    api('/collections')
      .then((d) => !cancelled && setState({ collections: d.collections, loading: false, error: '' }))
      .catch(
        (err) => !cancelled && setState({ collections: [], loading: false, error: err.message })
      );

    return () => {
      cancelled = true;
    };
  }, [tick]);

  async function create(data) {
    const d = await api('/collections', { method: 'POST', body: data });
    setCreating(false);
    notify(`Koleksi "${d.collection.name}" dibuat`);
    setTick((t) => t + 1);
  }

  const { collections, loading, error } = state;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Koleksi saya</h1>
          <p className="muted">Kelompokkan film, serial, dan musik dengan caramu sendiri.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>
          <Plus size={18} /> Buat koleksi
        </button>
      </div>

      {error ? (
        <div className="state-box">
          <p>{error}</p>
          <button className="btn btn-secondary btn-sm" onClick={() => setTick((t) => t + 1)}>
            Coba lagi
          </button>
        </div>
      ) : loading ? (
        <div className="collection-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: '1 / 1.3' }} />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="state-box">
          <p>Belum ada koleksi. Buat yang pertama untuk mulai menyusun daftarmu.</p>
          <button className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>
            Buat koleksi
          </button>
        </div>
      ) : (
        <div className="collection-grid">
          {collections.map((c) => (
            <Link key={c._id} to={`/collections/${c._id}`} className="collection-card">
              <div className="preview-grid">
                {Array.from({ length: 4 }).map((_, i) =>
                  c.previews[i] ? (
                    <img key={i} src={c.previews[i]} alt="" loading="lazy" />
                  ) : (
                    <div key={i} className="preview-empty" />
                  )
                )}
              </div>
              <h3>{c.name}</h3>
              <p className="card-sub">{c.itemCount} konten</p>
            </Link>
          ))}
        </div>
      )}

      {creating && (
        <CollectionForm
          title="Buat koleksi baru"
          submitLabel="Buat koleksi"
          onSubmit={create}
          onClose={() => setCreating(false)}
        />
      )}
    </>
  );
}