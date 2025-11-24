const express = require('express');

const indexController = require('../controllers/index.controller');

const router = express.Router();

router.use('/', indexController);

module.exports = router;