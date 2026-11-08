import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({ id, label, error, ...props }) {
  const [show, setShow] = useState(false);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className={`input-wrap ${error ? 'has-error' : ''}`}>
        <input id={id} type={show ? 'text' : 'password'} {...props} />
        <button
          type="button"
          className="icon-btn"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}