const router = require('express').Router();
const { processChat } = require('../services/chatService');

router.post('/', (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    const result = processChat(message.trim());
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Chat service error', detail: e.message });
  }
});

module.exports = router;
