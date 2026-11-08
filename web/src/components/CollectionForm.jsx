import { useEffect, useState } from 'react';
import TextInput from './TextInput';

export default function CollectionForm({ title, submitLabel, initial, onSubmit, onClose }) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama koleksi wajib diisi');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onSubmit({ name: name.trim(), description: description.trim() });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form
        className="modal modal-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        noValidate
      >
        <h2 id="form-title">{title}</h2>

        <TextInput
          id="col-name"
          label="Nama koleksi"
          placeholder="Contoh: Tontonan akhir pekan"
          maxLength={50}
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
        />

        <div className="field">
          <label htmlFor="col-desc">Deskripsi (opsional)</label>
          <textarea
            id="col-desc"
            className="textarea"
            maxLength={200}
            placeholder="Tentang koleksi ini"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Menyimpan...' : submitLabel}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}