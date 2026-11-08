import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Film, Heart, Music, Plus, Star } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import CollectionPicker from '../components/CollectionPicker';
import ReviewSection from '../components/ReviewSection';

const TYPES = ['movie', 'tv', 'music'];
const TYPE_LABEL = { movie: 'Film', tv: 'Serial', music: 'Musik' };
const EMPTY_REVIEWS = { average: null, count: 0, reviews: [] };

const formatDuration = (sec) =>
  `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

export default function Detail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorite, isWatched, toggleFavorite, toggleWatched, requireLogin } = useLibrary();

  const [state, setState] = useState({ item: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);
  const [reviews, setReviews] = useState(EMPTY_REVIEWS);
  const [reviewsError, setReviewsError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const valid = TYPES.includes(type) && /^\d+$/.test(id || '');

  // Ambil detail konten
  useEffect(() => {
    if (!valid) {
      setState({ item: null, loading: false, error: 'Konten tidak ditemukan' });
      return;
    }
    let cancelled = false;
    setState({ item: null, loading: true, error: '' });
    window.scrollTo(0, 0);

    api(`/content/${type}/${id}`)
      .then((item) => !cancelled && setState({ item, loading: false, error: '' }))
      .catch((err) => !cancelled && setState({ item: null, loading: false, error: err.message }));

    return () => {
      cancelled = true;
    };
  }, [type, id, valid, tick]);

  // Ambil ulasan
  const loadReviews = useCallback(async () => {
    try {
      const d = await api(`/reviews/${type}/${id}`);
      setReviews(d);
      setReviewsError('');
    } catch (err) {
      setReviewsError(err.message);
    }
  }, [type, id]);

  useEffect(() => {
    if (!valid) return;
    setReviews(EMPTY_REVIEWS);
    loadReviews();
  }, [valid, loadReviews]);

  const { item, loading, error } = state;

  // Judul tab browser
  useEffect(() => {
    document.title = item
      ? `${item.title} | Your One Entertainment List`
      : 'Your One Entertainment List';
    return () => {
      document.title = 'Your One Entertainment List';
    };
  }, [item]);

  const goBack = () =>
    window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate('/');

  function openPicker() {
    if (!user) return requireLogin();
    setPickerOpen(true);
  }

  /* Loading/error */
  if (loading) {
    return (
      <div className="detail-top">
        <div className="skeleton detail-poster-skel" />
        <div className="detail-info">
          <div className="skeleton line" style={{ height: 36, width: '60%' }} />
          <div className="skeleton line" />
          <div className="skeleton line" />
          <div className="skeleton line short" />
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="state-box">
        <p>{error || 'Konten tidak ditemukan'}</p>
        <div className="form-actions">
          {valid && (
            <button className="btn btn-secondary btn-sm" onClick={() => setTick((t) => t + 1)}>
              Coba lagi
            </button>
          )}
          <Link className="btn btn-primary btn-sm" to="/">
            Kembali ke Home
          </Link>
        </div>
      </div>
    );
  }

  /* Data turunan */
  const isMusic = item.type === 'music';
  const favorite = isFavorite(item);
  const watched = isWatched(item);

  const meta = isMusic
    ? [item.artist, item.album, item.duration ? formatDuration(item.duration) : null]
    : [
        item.year,
        item.type === 'tv' && item.seasons ? `${item.seasons} musim` : null,
        item.runtime ? `${item.runtime} menit${item.type === 'tv' ? '/episode' : ''}` : null,
      ];

  return (
    <>
      <button className="btn-text back-btn" onClick={goBack}>
        <ArrowLeft size={18} /> Kembali
      </button>

      <div className="detail-top">
        {item.posterUrl ? (
          <img
            className={`detail-poster ${isMusic ? 'square' : ''}`}
            src={item.posterUrl}
            alt={`Poster ${item.title}`}
          />
        ) : (
          <div className={`detail-poster poster-empty ${isMusic ? 'square' : ''}`}>
            {isMusic ? <Music size={48} /> : <Film size={48} />}
          </div>
        )}

        <div className="detail-info">
          <span className="chip active chip-static">{TYPE_LABEL[item.type]}</span>
          <h1>{item.title}</h1>
          {item.tagline && <p className="muted">{item.tagline}</p>}

          <p className="detail-meta">{meta.filter(Boolean).join(' • ')}</p>

          {item.genres && item.genres.length > 0 && (
            <div className="chips">
              {item.genres.map((g) => (
                <span key={g} className="chip chip-static">
                  {g}
                </span>
              ))}
            </div>
          )}

          <div className="rating-row">
            {!isMusic && (
              <div className="stat">
                <Star size={18} fill="currentColor" />
                {item.rating != null ? (
                  <span>
                    <strong>{item.rating.toFixed(1)}</strong>
                    <span className="rating-scale">/10</span> · TMDB
                  </span>
                ) : (
                  <span className="muted">Belum ada rating TMDB</span>
                )}
              </div>
            )}
            <div className="stat">
              <Star size={18} fill="currentColor" />
              {reviews.count > 0 ? (
                <span>
                  <strong>{reviews.average.toFixed(1)}</strong>
                  <span className="rating-scale">/5</span> · Komunitas ({reviews.count} ulasan)
                </span>
              ) : (
                <span className="muted">Belum ada rating komunitas</span>
              )}
            </div>
          </div>

          <div className="actions">
            <button
              className={`btn action-btn ${favorite ? 'on-fav' : ''}`}
              onClick={() => toggleFavorite(item)}
              aria-pressed={favorite}
            >
              <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
              {favorite ? 'Favorit' : 'Tambah favorit'}
            </button>

            <button
              className={`btn action-btn ${watched ? 'on-watched' : ''}`}
              onClick={() => toggleWatched(item)}
              aria-pressed={watched}
            >
              <Check size={18} />
              {watched
                ? isMusic ? 'Sudah didengar' : 'Sudah ditonton'
                : isMusic ? 'Tandai didengar' : 'Tandai ditonton'}
            </button>

            <button className="btn action-btn" onClick={openPicker}>
              <Plus size={18} /> Tambah ke koleksi
            </button>
          </div>

          {item.overview && (
            <div>
              <h3>Sinopsis</h3>
              <p className="detail-overview">{item.overview}</p>
            </div>
          )}

          {item.cast && item.cast.length > 0 && (
            <p className="muted">
              <strong>Pemeran:</strong> {item.cast.join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* Trailer */}
      <section className="section">
        <div className="section-head">
          <h2>{isMusic ? 'Preview lagu' : 'Trailer'}</h2>
        </div>

        {isMusic ? (
          item.previewUrl ? (
            <div className="audio-box">
              <audio controls preload="none" src={item.previewUrl}>
                Browser kamu tidak mendukung pemutar audio.
              </audio>
              <p className="muted">Cuplikan 30 detik dari Deezer.</p>
            </div>
          ) : (
            <div className="state-box">
              <p>Preview tidak tersedia untuk lagu ini.</p>
            </div>
          )
        ) : item.trailerKey ? (
          <>
            <div className="trailer">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${item.trailerKey}`}
                title={`Trailer ${item.title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <p className="muted" style={{ marginTop: 8 }}>
              Video tidak tampil?{' '}
              <a
                href={`https://www.youtube.com/watch?v=${item.trailerKey}`}
                target="_blank"
                rel="noreferrer"
              >
                Tonton di YouTube
              </a>
            </p>
          </>
        ) : (
          <div className="state-box">
            <p>Trailer tidak tersedia.</p>
          </div>
        )}
      </section>

      {/* Ulasan */}
      <ReviewSection
        type={item.type}
        contentId={item.id}
        data={reviews}
        error={reviewsError}
        reload={loadReviews}
      />

      {pickerOpen && <CollectionPicker item={item} onClose={() => setPickerOpen(false)} />}
    </>
  );
}