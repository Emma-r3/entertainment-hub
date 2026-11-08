const mongoose = require('mongoose');

const TYPES = ['movie', 'tv', 'music'];

const isValidId = (id) => mongoose.isValidObjectId(id);
const isValidContentId = (id) => /^\d+$/.test(String(id || ''));

// Membersihkan body konten yang dipakai favorit, watched, dan koleksi
function parseContent(body) {
  const { contentId, type, title, posterUrl } = body || {};
  if (!isValidContentId(contentId) || !TYPES.includes(type) || !title) return null;
  return {
    contentId: String(contentId),
    type,
    title: String(title).slice(0, 200),
    posterUrl: posterUrl ? String(posterUrl) : null,
  };
}

// Pembungkus agar tidak perlu try/catch di setiap fungsi
const wrap = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = { TYPES, isValidId, isValidContentId, parseContent, wrap };