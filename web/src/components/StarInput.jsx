import { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div
      className="star-input"
      role="radiogroup"
      aria-label="Beri rating 1 sampai 5 bintang"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} bintang`}
          className="star-btn"
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
        >
          <Star size={30} fill={n <= shown ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}