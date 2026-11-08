const service = require('../services/contentService');

const TYPES = ['movie', 'tv', 'music'];

function handle(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      console.error('Content error:', err.message);
      if (err.status === 404) {
        return res.status(404).json({ message: 'Konten tidak ditemukan' });
      }
      res.status(502).json({ message: 'Gagal mengambil data dari sumber konten' });
    }
  };
}

exports.trending = handle(async (req, res) => {
  const { type } = req.params;
  if (!TYPES.includes(type)) {
    return res.status(400).json({ message: 'Tipe harus movie, tv, atau music' });
  }
  res.json({ results: await service.getTrending(type) });
});

exports.newRelease = handle(async (req, res) => {
  const { type } = req.params;
  if (!TYPES.includes(type)) {
    return res.status(400).json({ message: 'Tipe harus movie, tv, atau music' });
  }
  res.json({ results: await service.getNew(type) });
});

exports.search = handle(async (req, res) => {
  const q = (req.query.q || '').trim();
  const type = req.query.type || 'all';
  if (!q) {
    return res.status(400).json({ message: 'Kata kunci pencarian wajib diisi' });
  }
  if (type !== 'all' && !TYPES.includes(type)) {
    return res.status(400).json({ message: 'Tipe harus all, movie, tv, atau music' });
  }
  res.json({ results: await service.search(q, type) });
});

exports.detail = handle(async (req, res) => {
  const { type, id } = req.params;
  if (!TYPES.includes(type)) {
    return res.status(400).json({ message: 'Tipe harus movie, tv, atau music' });
  }
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ message: 'ID tidak valid' });
  }
  res.json(await service.getDetail(type, id));
});