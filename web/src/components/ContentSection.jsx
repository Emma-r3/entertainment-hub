import ContentCard from './ContentCard';

function SkeletonCard() {
  return (
    <div className="card">
      <div className="skeleton poster-skel" />
      <div className="skeleton line" />
      <div className="skeleton line short" />
    </div>
  );
}

export default function ContentSection({
  title,
  items,
  loading,
  error,
  onRetry,
  layout = 'row',
  emptyText = 'Belum ada konten.',
}) {
  const listClass = layout === 'grid' ? 'content-grid' : 'row-scroll';

  let body;
  if (error) {
    body = (
      <div className="state-box">
        <p>{error}</p>
        <button className="btn btn-secondary btn-sm" onClick={onRetry}>
          Coba lagi
        </button>
      </div>
    );
  } else if (loading) {
    body = (
      <div className={listClass}>
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  } else if (items.length === 0) {
    body = (
      <div className="state-box">
        <p>{emptyText}</p>
      </div>
    );
  } else {
    body = (
      <div className={listClass}>
        {items.map((item) => (
          <ContentCard key={`${item.type}:${item.id}`} item={item} />
        ))}
      </div>
    );
  }

  return (
    <section className="section">
      {title && (
        <div className="section-head">
          <h2>{title}</h2>
        </div>
      )}
      {body}
    </section>
  );
}