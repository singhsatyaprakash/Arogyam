const express = require('express');
const chatController = require('../Controllers/chatControllers');
const router = express.Router();

router.post('/new-connection', chatController.newChatConnection);
router.get('/history/:connectionId', chatController.getChatHistory);
router.get('/patient/:patientId', chatController.getPatientChats);
router.get('/doctor/:doctorId', chatController.getDoctorChats);
router.put('/close/:connectionId', chatController.closeChatConnection);

module.exports = router;
