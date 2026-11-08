const express = require('express');
const auth = require('../middleware/auth');
const c = require('../controllers/collectionController');

const router = express.Router();
router.use(auth);

router.get('/', c.list);
router.post('/', c.create);
router.get('/:id', c.get);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
router.post('/:id/items', c.addItem);
router.delete('/:id/items/:type/:contentId', c.removeItem);

module.exports = router;