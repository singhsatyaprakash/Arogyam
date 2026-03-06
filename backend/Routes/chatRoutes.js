const express = require('express');
const chatController = require('../Controllers/chatControllers');
const router = express.Router();

router.post('/new-connection',chatController.newChatConnection);
module.exports = router;
