const express = require('express');
const auth = require('../middleware/auth');
const { register, login, me, updateTheme, stats } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, me);
router.patch('/theme', auth, updateTheme);
router.get('/stats', auth, stats);
module.exports = router;