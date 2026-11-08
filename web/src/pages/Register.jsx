import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TextInput from '../components/TextInput';
import PasswordInput from '../components/PasswordInput';
import ThemeToggle from '../components/ThemeToggle';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nama wajib diisi';
    if (!emailRegex.test(form.email)) errs.email = 'Format email tidak valid';
    if (form.password.length < 6) errs.password = 'Password minimal 6 karakter';
    if (form.confirm !== form.password) errs.confirm = 'Konfirmasi password tidak cocok';
    setErrors(errs);
    setServerError('');
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      await register(form.name.trim(), form.email, form.password);
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
          <h2>Mulai personalisasi daftar entertainmentmu hari ini.</h2>
          <p>Buat akun gratis untuk menyimpan favorit, menandai tontonan, dan menyusun koleksi sendiri.</p>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-top"><ThemeToggle /></div>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <h1>Daftar</h1>
          <p className="muted">Buat akun baru dalam hitungan detik.</p>

          {serverError && <div className="alert-error">{serverError}</div>}

          <TextInput id="name" name="name" label="Nama" placeholder="Nama lengkap"
            autoComplete="name" value={form.name} onChange={change} error={errors.name} />
          <TextInput id="email" name="email" label="Email" type="email"
            placeholder="nama@email.com" autoComplete="email"
            value={form.email} onChange={change} error={errors.email} />
          <PasswordInput id="password" name="password" label="Password"
            placeholder="Minimal 6 karakter" autoComplete="new-password"
            value={form.password} onChange={change} error={errors.password} />
          <PasswordInput id="confirm" name="confirm" label="Konfirmasi password"
            placeholder="Ulangi password" autoComplete="new-password"
            value={form.confirm} onChange={change} error={errors.confirm} />

          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Memproses...' : 'Daftar'}
          </button>

          <p className="auth-switch">
            Sudah punya akun? <Link to="/login">Masuk</Link>
          </p>
        </form>
      </main>
    </div>
  );
}