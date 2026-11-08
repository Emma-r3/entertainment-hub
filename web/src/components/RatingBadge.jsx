import { Star } from 'lucide-react';

export default function RatingBadge({ rating, type }) {
  if (rating == null) {
    return <span className="rating rating-none">Belum ada rating</span>;
  }
  const scale = type === 'music' ? 5 : 10;
  return (
    <span className="rating" aria-label={`Rating ${rating.toFixed(1)} dari ${scale}`}>
      <Star size={14} fill="currentColor" /> {rating.toFixed(1)}
      <span className="rating-scale">/{scale}</span>
    </span>
  );
}