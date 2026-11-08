require('dotenv').config();

['MONGO_URI', 'JWT_SECRET', 'TMDB_API_KEY'].forEach((key) => {
  if (!process.env[key]) {
    console.error(`Variabel ${key} belum diisi di .env`);
    process.exit(1);
  }
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use((req, res, next) => {
  if (req.body === undefined) req.body = {};
  next();
});

// Batasi percobaan login/register, maksimal 100 per 15 menit per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Pengecekan status server
app.get('/', (req, res) => {
  res.json({ message: 'Your One Entertainment List API berjalan' });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/watched', require('./routes/watchedRoutes'));
app.use('/api/collections', require('./routes/collectionRoutes'));

// Endpoint tidak ditemukan
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

// Penanganan error terpusat
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Format JSON tidak valid' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Data yang dikirim terlalu besar' });
  }
  console.error(err);
  res.status(500).json({ message: 'Terjadi kesalahan pada server' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));
});