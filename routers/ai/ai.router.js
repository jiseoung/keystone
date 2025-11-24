const express = require('express');

const checkLogin = require('../../middlewares/checkLogin.middleware');
const checkTime = require('../../middlewares/checkTime.middleware');
const chatController = require('../../controllers/ai/chat.controller');
const configController = require('../../controllers/ai/config.controller');

const router = express.Router();

router.use('/ai', checkLogin, configController);
router.use('/ai', checkLogin, checkTime, chatController);

module.exports = router;
