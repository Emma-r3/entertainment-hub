import { useState } from 'react';
import { Star } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import StarInput from './StarInput';

function Stars({ value }) {
  return (
    <span className="review-stars" aria-label={`${value} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={16} fill={n <= value ? 'currentColor' : 'none'} />
      ))}
    </span>
  );
}

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

export default function ReviewSection({ type, contentId, data, error, reload }) {
  const { user } = useAuth();
  const { notify, requireLogin } = useLibrary();

  const mine = user ? data.reviews.find((r) => String(r.userId) === String(user.id)) : null;

  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const showForm = user && (!mine || editing);

  function startEdit() {
    setRating(mine.rating);
    setComment(mine.comment || '');
    setFormError('');
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setRating(0);
    setComment('');
    setFormError('');
  }

  async function submit(e) {
    e.preventDefault();
    if (!rating) {
      setFormError('Pilih rating 1 sampai 5 bintang');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      if (editing && mine) {
        await api(`/reviews/${mine._id}`, {
          method: 'PUT',
          body: { rating, comment: comment.trim() },
        });
      } else {
        await api('/reviews', {
          method: 'POST',
          body: { contentId, type, rating, comment: comment.trim() },
        });
      }
      await reload();
      notify(editing ? 'Ulasan diperbarui' : 'Ulasan terkirim');
      cancelEdit();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function remove() {
    if (!window.confirm('Hapus ulasanmu?')) return;
    try {
      await api(`/reviews/${mine._id}`, { method: 'DELETE' });
      await reload();
      notify('Ulasan dihapus');
    } catch (err) {
      notify(err.message);
    }
  }

  return (
    <section className="section">
      <div className="section-head">
        <h2>Ulasan</h2>
        <p className="muted">
          {data.count > 0
            ? `${data.average.toFixed(1)}/5 dari ${data.count} ulasan`
            : 'Belum ada ulasan. Jadilah yang pertama!'}
        </p>
      </div>

      {!user && (
        <div className="review-form">
          <p className="muted">Masuk untuk memberi rating dan menulis ulasan.</p>
          <button className="btn btn-primary" style={{ justifySelf: 'start' }} onClick={requireLogin}>
            Masuk untuk memberi rating
          </button>
        </div>
      )}

      {showForm && (
        <form className="review-form" onSubmit={submit} noValidate>
          <h3>{editing ? 'Ubah ulasanmu' : 'Beri rating dan ulasan'}</h3>
          <StarInput value={rating} onChange={setRating} />
          <textarea
            className="textarea"
            placeholder="Tulis ulasanmu (opsional)"
            aria-label="Ulasan"
            maxLength={500}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <p className="char-count">{comment.length}/500</p>
          {formError && <p className="error-text">{formError}</p>}
          <div className="form-actions">
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Mengirim...' : editing ? 'Simpan perubahan' : 'Kirim ulasan'}
            </button>
            {editing && (
              <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                Batal
              </button>
            )}
          </div>
        </form>
      )}

      {error && <p className="error-text">{error}</p>}

      {data.reviews.length > 0 && (
        <div className="review-list">
          {data.reviews.map((r) => {
            const isMine = mine && r._id === mine._id;
            return (
              <article key={r._id} className={`review-item ${isMine ? 'mine' : ''}`}>
                <div className="review-head">
                  <div className="avatar sm" aria-hidden="true">
                    {r.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong>{isMine ? `${r.userName} (kamu)` : r.userName}</strong>
                    <p className="card-sub">{formatDate(r.createdAt)}</p>
                  </div>
                  <Stars value={r.rating} />
                </div>
                {r.comment && <p className="review-comment">{r.comment}</p>}
                {isMine && !editing && (
                  <div className="review-actions">
                    <button className="btn-text" onClick={startEdit}>
                      Ubah
                    </button>
                    <button className="btn-text danger" onClick={remove}>
                      Hapus
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}