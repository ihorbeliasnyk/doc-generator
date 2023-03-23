const express = require('express');

const describe = require('./describe');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/describe', describe);

module.exports = router;
