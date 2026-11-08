const Watched = require('../models/Watched');
const { parseContent, wrap } = require('../utils/helpers');

// GET /api/watched/ids  ["movie:550", "tv:1396"]
exports.ids = wrap(async (req, res) => {
  const docs = await Watched.find({ userId: req.userId }).select('contentId type -_id');
  res.json({ ids: docs.map((d) => `${d.type}:${d.contentId}`) });
});

// GET /api/watched daftar lengkap
exports.list = wrap(async (req, res) => {
  const watched = await Watched.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ watched });
});

// POST /api/watched/toggle klik sekali = ditonton, klik lagi = belum
exports.toggle = wrap(async (req, res) => {
  const content = parseContent(req.body);
  if (!content) {
    return res.status(400).json({ message: 'contentId, type, dan title wajib diisi dengan benar' });
  }

  const filter = { userId: req.userId, contentId: content.contentId, type: content.type };

  const removed = await Watched.findOneAndDelete(filter);
  if (removed) {
    return res.json({ watched: false });
  }

  await Watched.create({ ...filter, title: content.title, posterUrl: content.posterUrl });
  res.json({ watched: true });
});