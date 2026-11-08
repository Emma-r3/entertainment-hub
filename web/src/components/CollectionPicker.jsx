import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../api';
import { useLibrary } from '../context/LibraryContext';

export default function CollectionPicker({ item, onClose }) {
  const { notify } = useLibrary();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    api('/collections')
      .then((d) => setCollections(d.collections))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const body = {
    contentId: item.id,
    type: item.type,
    title: item.title,
    posterUrl: item.posterUrl || null,
  };

  async function addTo(collection) {
    if (busy) return;
    setBusy(true);
    try {
      await api(`/collections/${collection._id}/items`, { method: 'POST', body });
      notify(`Ditambahkan ke "${collection.name}"`);
      onClose();
    } catch (err) {
      if (err.status === 409) {
        notify(`Sudah ada di "${collection.name}"`);
        onClose();
      } else {
        notify(err.message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function createAndAdd(e) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) {
      setError('Nama koleksi wajib diisi');
      return;
    }
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const d = await api('/collections', { method: 'POST', body: { name } });
      await api(`/collections/${d.collection._id}/items`, { method: 'POST', body });
      notify(`Ditambahkan ke koleksi baru "${name}"`);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal modal-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="picker-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="picker-title">Tambah ke koleksi</h2>

        {loading ? (
          <p className="muted">Memuat koleksi...</p>
        ) : (
          <>
            {collections.length > 0 ? (
              <div className="picker-list">
                {collections.map((c) => (
                  <button
                    key={c._id}
                    className="picker-item"
                    disabled={busy}
                    onClick={() => addTo(c)}
                  >
                    <span>{c.name}</span>
                    <span className="muted">{c.itemCount} konten</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="muted">Kamu belum punya koleksi. Buat yang pertama di bawah.</p>
            )}

            <form className="picker-new" onSubmit={createAndAdd} noValidate>
              <div className={`input-wrap ${error ? 'has-error' : ''}`}>
                <input
                  placeholder="Nama koleksi baru"
                  aria-label="Nama koleksi baru"
                  maxLength={50}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" disabled={busy} aria-label="Buat koleksi dan tambahkan">
                <Plus size={18} />
              </button>
            </form>
            {error && <p className="error-text">{error}</p>}
          </>
        )}

        <button className="btn-text" onClick={onClose}>
          Batal
        </button>
      </div>
    </div>
  );
}