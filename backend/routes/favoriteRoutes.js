const express = require('express');
const auth = require('../middleware/auth');
const c = require('../controllers/favoriteController');

const router = express.Router();
router.use(auth);

router.get('/', c.list);
router.post('/', c.add);
router.delete('/:id', c.remove);

module.exports = router;