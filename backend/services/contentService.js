const IMG = 'https://image.tmdb.org/t/p';

/* Cache sederhana 10 menit */
const cache = new Map();
const TTL = 10 * 60 * 1000;

async function cached(key, fn) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.time < TTL) return hit.data;
  const data = await fn();
  cache.set(key, { data, time: Date.now() });
  return data;
}

function httpError(status) {
  return Object.assign(new Error(`Sumber konten error ${status}`), { status });
}

/* Pemanggil API */
async function tmdbGet(path, params = {}) {
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  url.searchParams.set('api_key', process.env.TMDB_API_KEY);
  url.searchParams.set('language', 'en-US');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url);
  if (!res.ok) throw httpError(res.status);
  return res.json();
}

async function deezerGet(path, params = {}) {
  const url = new URL(`https://api.deezer.com${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url);
  if (!res.ok) throw httpError(res.status);
  const data = await res.json();
  if (data.error) throw httpError(data.error.code === 800 ? 404 : 502);
  return data;
}

/* Pengubah ke format seragam */
function tmdbItem(x, type) {
  const date = x.release_date || x.first_air_date || '';
  return {
    id: String(x.id),
    type,
    title: x.title || x.name || '',
    subtitle: null,
    posterUrl: x.poster_path ? `${IMG}/w500${x.poster_path}` : null,
    backdropUrl: x.backdrop_path ? `${IMG}/w780${x.backdrop_path}` : null,
    year: date ? date.slice(0, 4) : null,
    rating: x.vote_average ? Math.round(x.vote_average * 10) / 10 : null,
    overview: x.overview || '',
  };
}

function deezerItem(t) {
  return {
    id: String(t.id),
    type: 'music',
    title: t.title,
    subtitle: t.artist ? t.artist.name : null,
    posterUrl: t.album ? t.album.cover_big || t.album.cover_medium || null : null,
    year: null,
    rating: null,
    previewUrl: t.preview || null,
  };
}

/* Trending */
async function getTrending(type) {
  return cached(`trending:${type}`, async () => {
    if (type === 'music') {
      const data = await deezerGet('/chart/0/tracks', { limit: 20 });
      return data.data.map(deezerItem);
    }
    const data = await tmdbGet(`/trending/${type}/week`);
    return data.results.map((x) => tmdbItem(x, type));
  });
}

/* New release */
async function getNew(type) {
  return cached(`new:${type}`, async () => {
    if (type === 'music') {
      const rel = await deezerGet('/editorial/0/releases', { limit: 12 });
      const albums = rel.data.slice(0, 10);
      const details = await Promise.allSettled(
        albums.map((a) => deezerGet(`/album/${a.id}`))
      );
      return details
        .filter((d) => d.status === 'fulfilled')
        .map((d) => {
          const album = d.value;
          const track = album.tracks && album.tracks.data && album.tracks.data[0];
          if (!track) return null;
          return {
            id: String(track.id),
            type: 'music',
            title: track.title,
            subtitle: album.artist ? album.artist.name : null,
            posterUrl: album.cover_big || album.cover_medium || null,
            year: album.release_date ? album.release_date.slice(0, 4) : null,
            rating: null,
            previewUrl: track.preview || null,
          };
        })
        .filter(Boolean);
    }
    const path = type === 'movie' ? '/movie/now_playing' : '/tv/on_the_air';
    const data = await tmdbGet(path);
    return data.results.map((x) => tmdbItem(x, type));
  });
}

/* Search */
async function searchOne(q, type) {
  if (type === 'music') {
    const data = await deezerGet('/search', { q, limit: 20 });
    return data.data.map(deezerItem);
  }
  const data = await tmdbGet(`/search/${type}`, { query: q });
  return data.results.map((x) => tmdbItem(x, type));
}

async function search(q, type) {
  const types = type && type !== 'all' ? [type] : ['movie', 'tv', 'music'];
  const results = await Promise.allSettled(types.map((t) => searchOne(q, t)));
  return results.filter((r) => r.status === 'fulfilled').flatMap((r) => r.value);
}

/* Detail */
async function getDetail(type, id) {
  if (type === 'music') {
    const t = await deezerGet(`/track/${id}`);
    return {
      ...deezerItem(t),
      year: t.release_date ? t.release_date.slice(0, 4) : null,
      artist: t.artist ? t.artist.name : null,
      album: t.album ? t.album.title : null,
      duration: t.duration || null,
      releaseDate: t.release_date || null,
      trailerKey: null,
    };
  }

  const d = await tmdbGet(`/${type}/${id}`, { append_to_response: 'videos,credits' });
  const videos = ((d.videos && d.videos.results) || []).filter((v) => v.site === 'YouTube');
  const trailer =
    videos.find((v) => v.type === 'Trailer') || videos.find((v) => v.type === 'Teaser');

  return {
    ...tmdbItem(d, type),
    tagline: d.tagline || '',
    genres: (d.genres || []).map((g) => g.name),
    runtime: type === 'movie' ? d.runtime || null : (d.episode_run_time || [])[0] || null,
    seasons: type === 'tv' ? d.number_of_seasons || null : null,
    voteCount: d.vote_count || 0,
    cast: ((d.credits && d.credits.cast) || []).slice(0, 8).map((c) => c.name),
    trailerKey: trailer ? trailer.key : null,
  };
}

module.exports = { getTrending, getNew, search, getDetail };