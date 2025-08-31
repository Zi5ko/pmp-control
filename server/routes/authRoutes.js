//server/routes/authRoutes.js
const passport = require('passport');
const router = require('express').Router();
const { verifyToken } = require('../middlewares/auth');
const {
  startGoogleAuth,
  googleCallback,
  localLogin,
  me
} = require('../controllers/authController');

// Login con Google
router.get('/google', startGoogleAuth);
router.get('/google/callback', googleCallback);

// Login local
router.post('/login', localLogin);

// Obtener datos del usuario autenticado
router.get('/me', verifyToken, me); // lee desde cookie 'jwt'

module.exports = router;