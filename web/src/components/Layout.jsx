import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <>
      <a href="#konten" className="skip-link">
        Lewati ke konten
      </a>
      <Navbar />
      <main id="konten" className="container page" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          <p>
            Data film dan serial dari TMDB, musik dari Deezer. This product uses the TMDB API but is
            not endorsed or certified by TMDB.
          </p>
        </div>
      </footer>
    </>
  );
}