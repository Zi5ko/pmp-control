const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'api', time: new Date().toISOString() });
});

module.exports = router;