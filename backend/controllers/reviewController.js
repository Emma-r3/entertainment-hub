const Review = require('../models/Review');
const User = require('../models/User');
const { TYPES, isValidId, isValidContentId, wrap } = require('../utils/helpers');

const round1 = (n) => Math.round(n * 10) / 10;
const validRating = (r) => Number.isInteger(r) && r >= 1 && r <= 5;

// GET /api/reviews/:type/:id daftar ulasan dan rata-rata
exports.list = wrap(async (req, res) => {
  const { type, id } = req.params;
  if (!TYPES.includes(type) || !isValidContentId(id)) {
    return res.status(400).json({ message: 'Tipe atau ID konten tidak valid' });
  }

  const [reviews, stats] = await Promise.all([
    Review.find({ type, contentId: id }).sort({ createdAt: -1 }).limit(50),
    Review.aggregate([
      { $match: { type, contentId: id } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
  ]);

  const s = stats[0];
  res.json({ average: s ? round1(s.avg) : null, count: s ? s.count : 0, reviews });
});

// GET /api/reviews/summary?type=music&ids=1,2,3
exports.summary = wrap(async (req, res) => {
  const { type } = req.query;
  const ids = String(req.query.ids || '')
    .split(',')
    .map((s) => s.trim())
    .filter(isValidContentId)
    .slice(0, 50);

  if (!TYPES.includes(type) || ids.length === 0) {
    return res.status(400).json({ message: 'type dan ids wajib diisi dengan benar' });
  }

  const rows = await Review.aggregate([
    { $match: { type, contentId: { $in: ids } } },
    { $group: { _id: '$contentId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const summary = {};
  rows.forEach((r) => {
    summary[r._id] = { average: round1(r.avg), count: r.count };
  });
  res.json({ summary });
});

// POST /api/reviews
exports.create = wrap(async (req, res) => {
  const { contentId, type, rating, comment } = req.body;

  if (!isValidContentId(contentId) || !TYPES.includes(type)) {
    return res.status(400).json({ message: 'contentId atau type tidak valid' });
  }
  if (!validRating(Number(rating))) {
    return res.status(400).json({ message: 'Rating harus bilangan bulat 1 sampai 5' });
  }
  if (comment && String(comment).length > 500) {
    return res.status(400).json({ message: 'Ulasan maksimal 500 karakter' });
  }

  const user = await User.findById(req.userId).select('name');
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

  try {
    const review = await Review.create({
      userId: req.userId,
      userName: user.name,
      contentId: String(contentId),
      type,
      rating: Number(rating),
      comment: comment || '',
    });
    res.status(201).json({ review });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: 'Kamu sudah memberi ulasan untuk konten ini. Silakan ubah ulasanmu.' });
    }
    throw err;
  }
});

// PUT /api/reviews/:id
exports.update = wrap(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: 'ID tidak valid' });

  const review = await Review.findOne({ _id: id, userId: req.userId });
  if (!review) return res.status(404).json({ message: 'Ulasan tidak ditemukan' });

  const { rating, comment } = req.body;

  if (rating !== undefined) {
    if (!validRating(Number(rating))) {
      return res.status(400).json({ message: 'Rating harus bilangan bulat 1 sampai 5' });
    }
    review.rating = Number(rating);
  }
  if (comment !== undefined) {
    if (String(comment).length > 500) {
      return res.status(400).json({ message: 'Ulasan maksimal 500 karakter' });
    }
    review.comment = String(comment).trim();
  }

  await review.save();
  res.json({ review });
});

// DELETE /api/reviews/:id
exports.remove = wrap(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: 'ID tidak valid' });

  const deleted = await Review.findOneAndDelete({ _id: id, userId: req.userId });
  if (!deleted) return res.status(404).json({ message: 'Ulasan tidak ditemukan' });

  res.json({ message: 'Ulasan dihapus' });
});