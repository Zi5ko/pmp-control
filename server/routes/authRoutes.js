const router = require('express').Router();
const passport = require('passport');
const { startGoogleAuth, googleCallback } = require('../controllers/authController');

router.get('/google', startGoogleAuth);
router.get('/google/callback', googleCallback);

module.exports = router;