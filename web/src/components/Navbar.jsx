import { Link, NavLink } from 'react-router-dom';
import { Film } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user } = useAuth();
  const linkClass = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`;

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="nav-logo">
          <Film size={24} color="var(--primary)" />
          <span className="nav-logo-text">Your One Entertainment List</span>
        </Link>

        <nav className="nav-links" aria-label="Menu utama">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          {user && (
            <>
              <NavLink to="/favorites" className={linkClass}>
                Favorit
              </NavLink>
              <NavLink to="/collections" className={linkClass}>
                Koleksi
              </NavLink>
              <NavLink to="/profile" className={linkClass}>
                Profil
              </NavLink>
            </>
          )}
        </nav>

        <div className="nav-right">
          <ThemeToggle />
          {user ? (
            <Link to="/profile" className="avatar" aria-label="Profil">
              {user.name.charAt(0).toUpperCase()}
            </Link>
          ) : (
            <>
              <Link className="btn btn-secondary btn-sm" to="/login">
                Masuk
              </Link>
              <Link className="btn btn-primary btn-sm" to="/register">
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}