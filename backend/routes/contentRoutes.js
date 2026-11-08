const express = require('express');
const { trending, newRelease, search, detail } = require('../controllers/contentController');

const router = express.Router();

// Urutan rute spesifik di atas, rute umum /:type/:id di bawah
router.get('/trending/:type', trending);
router.get('/new/:type', newRelease);
router.get('/search', search);
router.get('/:type/:id', detail);

module.exports = router;