import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, X } from 'lucide-react';
import { api } from '../api';
import { useLibrary } from '../context/LibraryContext';
import ContentCard from '../components/ContentCard';
import CollectionForm from '../components/CollectionForm';

export default function CollectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useLibrary();
  const [state, setState] = useState({ collection: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState({ collection: null, loading: true, error: '' });

    api(`/collections/${id}`)
      .then((d) => !cancelled && setState({ collection: d.collection, loading: false, error: '' }))
      .catch(
        (err) => !cancelled && setState({ collection: null, loading: false, error: err.message })
      );

    return () => {
      cancelled = true;
    };
  }, [id, tick]);

  const { collection, loading, error } = state;

  async function rename(data) {
    const d = await api(`/collections/${id}`, { method: 'PUT', body: data });
    setState((s) => ({ ...s, collection: d.collection }));
    setEditing(false);
    notify('Koleksi diperbarui');
  }

  async function removeCollection() {
    if (!window.confirm(`Hapus koleksi "${collection.name}"? Konten di dalamnya tidak ikut terhapus dari aplikasi.`)) {
      return;
    }
    try {
      await api(`/collections/${id}`, { method: 'DELETE' });
      notify('Koleksi dihapus');
      navigate('/collections');
    } catch (err) {
      notify(err.message);
    }
  }

  async function removeItem(item) {
    try {
      const d = await api(`/collections/${id}/items/${item.type}/${item.contentId}`, {
        method: 'DELETE',
      });
      setState((s) => ({ ...s, collection: d.collection }));
      notify('Dihapus dari koleksi');
    } catch (err) {
      notify(err.message);
    }
  }

  if (loading) {
    return (
      <>
        <div className="skeleton line" style={{ height: 36, width: '40%' }} />
        <div className="skeleton line short" />
      </>
    );
  }

  if (error || !collection) {
    return (
      <div className="state-box">
        <p>{error || 'Koleksi tidak ditemukan'}</p>
        <div className="form-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => setTick((t) => t + 1)}>
            Coba lagi
          </button>
          <Link className="btn btn-primary btn-sm" to="/collections">
            Ke daftar koleksi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Link to="/collections" className="btn-text back-btn">
        <ArrowLeft size={18} /> Semua koleksi
      </Link>

      <div className="page-head">
        <div>
          <h1>{collection.name}</h1>
          {collection.description && <p className="muted">{collection.description}</p>}
          <p className="muted">{collection.items.length} konten</p>
        </div>
        <div className="form-actions">
          <button className="btn btn-secondary" onClick={() => setEditing(true)}>
            <Pencil size={16} style={{ marginRight: 8 }} /> Ubah
          </button>
          <button className="btn btn-secondary danger-btn" onClick={removeCollection}>
            <Trash2 size={16} style={{ marginRight: 8 }} /> Hapus
          </button>
        </div>
      </div>

      {collection.items.length === 0 ? (
        <div className="state-box">
          <p>Koleksi masih kosong. Buka halaman Detail suatu konten, lalu pilih "Tambah ke koleksi".</p>
          <Link className="btn btn-primary btn-sm" to="/">
            Jelajahi konten
          </Link>
        </div>
      ) : (
        <div className="content-grid">
          {collection.items.map((i) => (
            <div key={`${i.type}:${i.contentId}`} className="card-wrap">
              <ContentCard
                item={{ id: i.contentId, type: i.type, title: i.title, posterUrl: i.posterUrl }}
              />
              <button className="remove-link" onClick={() => removeItem(i)}>
                <X size={14} /> Hapus dari koleksi
              </button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <CollectionForm
          title="Ubah koleksi"
          submitLabel="Simpan perubahan"
          initial={collection}
          onSubmit={rename}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}