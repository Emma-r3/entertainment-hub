const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Favorite = require('../models/Favorite');
const Watched = require('../models/Watched');
const Collection = require('../models/Collection');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function userResponse(user) {
  return { id: user._id, name: user.name, email: user.email, theme: user.theme };
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Format email tidak valid' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({ token: createToken(user._id), user: userResponse(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    const match = user && (await bcrypt.compare(password, user.password));

    if (!match) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    res.json({ token: createToken(user._id), user: userResponse(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.json({ user: userResponse(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.updateTheme = async (req, res) => {
  try {
    const { theme } = req.body || {};
    if (!['light', 'dark'].includes(theme)) {
      return res.status(400).json({ message: 'Tema harus light atau dark' });
    }
    const user = await User.findByIdAndUpdate(req.userId, { theme }, { new: true });
    res.json({ user: userResponse(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.stats = async (req, res) => {
  try {
    const [watched, favorites, collections] = await Promise.all([
      Watched.countDocuments({ userId: req.userId }),
      Favorite.countDocuments({ userId: req.userId }),
      Collection.countDocuments({ userId: req.userId }),
    ]);
    res.json({ watched, favorites, collections });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};