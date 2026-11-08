import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Folder, Heart, LogOut } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/auth/stats')
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const items = [
    { key: 'watched', label: 'Sudah ditonton', icon: <Check size={20} /> },
    { key: 'favorites', label: 'Favorit', icon: <Heart size={20} /> },
    { key: 'collections', label: 'Koleksi', icon: <Folder size={20} /> },
  ];

  return (
    <div className="profile">
      <div className="profile-head">
        <div className="avatar xl" aria-hidden="true">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h1>{user.name}</h1>
        <p className="muted">{user.email}</p>
      </div>

      {error && <p className="error-text">Statistik belum bisa dimuat: {error}</p>}

      <div className="stats">
        {items.map((s) => (
          <div key={s.key} className="stat-card">
            <span className="stat-icon">{s.icon}</span>
            <strong>{stats ? stats[s.key] : '-'}</strong>
            <span className="muted">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="setting-row">
        <div>
          <strong>Mode gelap</strong>
          <p className="muted">Pilihanmu tersimpan di akun dan dipakai di semua perangkat.</p>
        </div>
        <button
          className="switch"
          role="switch"
          aria-checked={theme === 'dark'}
          aria-label="Mode gelap"
          onClick={toggleTheme}
        />
      </div>

      <button className="btn btn-secondary danger-btn" onClick={handleLogout}>
        <LogOut size={18} style={{ marginRight: 8 }} /> Logout
      </button>

      <p className="card-sub">
        Data film dan serial dari TMDB, musik dari Deezer.
      </p>
    </div>
  );
}