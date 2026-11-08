import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LoginModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title">Masuk dulu untuk menyimpan</h2>
        <p className="muted">
          Favorit, watched, rating, dan koleksi tersimpan di akunmu. Masuk atau daftar gratis untuk
          memakainya.
        </p>
        <div className="modal-actions">
          <Link className="btn btn-primary" to="/login" onClick={onClose}>
            Masuk
          </Link>
          <Link className="btn btn-secondary" to="/register" onClick={onClose}>
            Daftar
          </Link>
        </div>
        <button className="btn-text" onClick={onClose}>
          Nanti saja
        </button>
      </div>
    </div>
  );
}