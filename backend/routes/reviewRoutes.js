const express = require('express');
const auth = require('../middleware/auth');
const c = require('../controllers/reviewController');

const router = express.Router();

// Publik
router.get('/summary', c.summary);      // harus di atas /:type/:id
router.get('/:type/:id', c.list);

// Wajib login
router.post('/', auth, c.create);
router.put('/:id', auth, c.update);
router.delete('/:id', auth, c.remove);

module.exports = router;