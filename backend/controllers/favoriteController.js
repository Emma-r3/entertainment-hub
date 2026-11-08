const Favorite = require('../models/Favorite');
const { isValidId, parseContent, wrap } = require('../utils/helpers');

// GET /api/favorites
exports.list = wrap(async (req, res) => {
  const favorites = await Favorite.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ favorites });
});

// POST /api/favorites
exports.add = wrap(async (req, res) => {
  const content = parseContent(req.body);
  if (!content) {
    return res.status(400).json({ message: 'contentId, type, dan title wajib diisi dengan benar' });
  }

  const favorite = await Favorite.findOneAndUpdate(
    { userId: req.userId, contentId: content.contentId, type: content.type },
    { $setOnInsert: { title: content.title, posterUrl: content.posterUrl } },
    { upsert: true, new: true }
  );
  res.status(201).json({ favorite });
});

// DELETE /api/favorites/:id
exports.remove = wrap(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: 'ID tidak valid' });

  const deleted = await Favorite.findOneAndDelete({ _id: id, userId: req.userId });
  if (!deleted) return res.status(404).json({ message: 'Favorit tidak ditemukan' });

  res.json({ message: 'Favorit dihapus' });
});