const express = require('express');
const auth = require('../middleware/auth');
const c = require('../controllers/watchedController');

const router = express.Router();
router.use(auth);

router.get('/ids', c.ids);
router.get('/', c.list);
router.post('/toggle', c.toggle);

module.exports = router;