const express = require('express');
const v1Router = require('./v1');

const router = express.Router();

/**
 * http://localhost:2000/api/v1
 */
router.use('/v1',v1Router);

module.exports = router;
