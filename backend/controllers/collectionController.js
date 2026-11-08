const Collection = require('../models/Collection');
const { TYPES, isValidId, isValidContentId, parseContent, wrap } = require('../utils/helpers');

function cleanName(name) {
  const n = String(name || '').trim();
  return n.length >= 1 && n.length <= 50 ? n : null;
}

// GET /api/collections ringkasan untuk halaman daftar koleksi
exports.list = wrap(async (req, res) => {
  const cols = await Collection.find({ userId: req.userId }).sort({ updatedAt: -1 });
  res.json({
    collections: cols.map((c) => ({
      _id: c._id,
      name: c.name,
      description: c.description,
      itemCount: c.items.length,
      previews: c.items.slice(0, 4).map((i) => i.posterUrl),
      updatedAt: c.updatedAt,
    })),
  });
});

// POST /api/collections
exports.create = wrap(async (req, res) => {
  const name = cleanName(req.body.name);
  if (!name) return res.status(400).json({ message: 'Nama koleksi wajib diisi (maksimal 50 karakter)' });

  const description = String(req.body.description || '').trim().slice(0, 200);
  const collection = await Collection.create({ userId: req.userId, name, description });
  res.status(201).json({ collection });
});

// GET /api/collections/:id isi lengkap satu koleksi
exports.get = wrap(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: 'ID tidak valid' });

  const collection = await Collection.findOne({ _id: id, userId: req.userId });
  if (!collection) return res.status(404).json({ message: 'Koleksi tidak ditemukan' });

  res.json({ collection });
});

// PUT /api/collections/:id ubah nama/deskripsi
exports.update = wrap(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: 'ID tidak valid' });

  const collection = await Collection.findOne({ _id: id, userId: req.userId });
  if (!collection) return res.status(404).json({ message: 'Koleksi tidak ditemukan' });

  if (req.body.name !== undefined) {
    const name = cleanName(req.body.name);
    if (!name) return res.status(400).json({ message: 'Nama koleksi wajib diisi (maksimal 50 karakter)' });
    collection.name = name;
  }
  if (req.body.description !== undefined) {
    collection.description = String(req.body.description).trim().slice(0, 200);
  }

  await collection.save();
  res.json({ collection });
});

// DELETE /api/collections/:id
exports.remove = wrap(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: 'ID tidak valid' });

  const deleted = await Collection.findOneAndDelete({ _id: id, userId: req.userId });
  if (!deleted) return res.status(404).json({ message: 'Koleksi tidak ditemukan' });

  res.json({ message: 'Koleksi dihapus' });
});

// POST /api/collections/:id/items
exports.addItem = wrap(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: 'ID tidak valid' });

  const item = parseContent(req.body);
  if (!item) {
    return res.status(400).json({ message: 'contentId, type, dan title wajib diisi dengan benar' });
  }

  const collection = await Collection.findOne({ _id: id, userId: req.userId });
  if (!collection) return res.status(404).json({ message: 'Koleksi tidak ditemukan' });

  const exists = collection.items.some(
    (i) => i.contentId === item.contentId && i.type === item.type
  );
  if (exists) {
    return res.status(409).json({ message: 'Konten sudah ada di koleksi ini' });
  }

  collection.items.push(item);
  await collection.save();
  res.status(201).json({ collection });
});

// DELETE /api/collections/:id/items/:type/:contentId
exports.removeItem = wrap(async (req, res) => {
  const { id, type, contentId } = req.params;
  if (!isValidId(id) || !TYPES.includes(type) || !isValidContentId(contentId)) {
    return res.status(400).json({ message: 'Parameter tidak valid' });
  }

  const collection = await Collection.findOne({ _id: id, userId: req.userId });
  if (!collection) return res.status(404).json({ message: 'Koleksi tidak ditemukan' });

  const before = collection.items.length;
  collection.items = collection.items.filter(
    (i) => !(i.type === type && i.contentId === contentId)
  );
  if (collection.items.length === before) {
    return res.status(404).json({ message: 'Konten tidak ada di koleksi ini' });
  }

  await collection.save();
  res.json({ collection });
});