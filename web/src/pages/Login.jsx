import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TextInput from '../components/TextInput';
import PasswordInput from '../components/PasswordInput';
import ThemeToggle from '../components/ThemeToggle';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!emailRegex.test(form.email)) errs.email = 'Format email tidak valid';
    if (!form.password) errs.password = 'Password wajib diisi';
    setErrors(errs);
    setServerError('');
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <aside className="auth-brand">
        <div className="brand-logo"><Film size={28} /> Your One Entertainment List</div>
        <div>
          <h2>Semua tontonan dan musikmu dalam satu daftar.</h2>
          <p>Temukan film, serial, dan musik. Beri rating, simpan favorit, dan catat apa yang sudah kamu nikmati.</p>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-top"><ThemeToggle /></div>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <h1>Masuk</h1>
          <p className="muted">Selamat datang kembali.</p>

          {serverError && <div className="alert-error">{serverError}</div>}

          <TextInput id="email" name="email" label="Email" type="email"
            placeholder="nama@email.com" autoComplete="email"
            value={form.email} onChange={change} error={errors.email} />
          <PasswordInput id="password" name="password" label="Password"
            placeholder="Masukkan password" autoComplete="current-password"
            value={form.password} onChange={change} error={errors.password} />

          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Memproses...' : 'Masuk'}
          </button>

          <p className="auth-switch">
            Belum punya akun? <Link to="/register">Daftar</Link>
          </p>
          <p className="auth-switch"><Link to="/">Jelajahi sebagai tamu</Link></p>
        </form>
      </main>
    </div>
  );
}