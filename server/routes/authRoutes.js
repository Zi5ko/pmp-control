const passport = require('passport');
const router = require('express').Router();
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
router.get('/me', me); // lee desde cookie 'jwt'

module.exports = router;