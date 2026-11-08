import { api } from '../api';

// Menambahkan rating komunitas ke item musik
export async function attachMusicRatings(items) {
  const ids = [...new Set(items.filter((i) => i.type === 'music').map((i) => i.id))].slice(0, 50);
  if (ids.length === 0) return items;

  try {
    const { summary } = await api(`/reviews/summary?type=music&ids=${ids.join(',')}`);
    return items.map((i) =>
      i.type === 'music' ? { ...i, rating: summary[i.id] ? summary[i.id].average : null } : i
    );
  } catch {
    return items;
  }
}

export async function loadList(path) {
  const { results } = await api(path);
  return attachMusicRatings(results);
}