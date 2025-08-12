const router = require('express').Router();
const {
  startGoogleAuth,
  googleCallback,
  localLogin,
  me
} = require('../controllers/authController');

router.get('/google', startGoogleAuth);
router.get('/google/callback', googleCallback);
router.post('/login', localLogin);
router.get('/me', me);

module.exports = router;