import { Link } from 'react-router-dom';
import { Check, Film, Heart, Music } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import RatingBadge from './RatingBadge';

export default function ContentCard({ item }) {
  const { isWatched, isFavorite, toggleFavorite } = useLibrary();
  const watched = isWatched(item);
  const favorite = isFavorite(item);
  const isMusic = item.type === 'music';

  return (
    <article className="card">
      <Link to={`/detail/${item.type}/${item.id}`} className="card-link">
        <div className={`poster ${isMusic ? 'square' : ''}`}>
          {item.posterUrl ? (
            <img src={item.posterUrl} alt={`Poster ${item.title}`} loading="lazy" />
          ) : (
            <div className="poster-empty">{isMusic ? <Music size={32} /> : <Film size={32} />}</div>
          )}
          {watched && (
            <span className="badge-watched">
              <Check size={12} /> Watched
            </span>
          )}
        </div>
        <h3 className="card-title">{item.title}</h3>
        <p className="card-sub">{(isMusic ? item.subtitle : item.year) || '\u00A0'}</p>
        {item.rating !== undefined && <RatingBadge rating={item.rating} type={item.type} />}
      </Link>

      <button
        className={`fav-btn ${favorite ? 'active' : ''}`}
        onClick={() => toggleFavorite(item)}
        aria-label={favorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
        aria-pressed={favorite}
      >
        <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
      </button>
    </article>
  );
}