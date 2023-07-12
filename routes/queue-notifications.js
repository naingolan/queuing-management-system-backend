const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Queue = require('../models/queue');
const User = require('../models/user');
const { sendQueueStatusEmail } = require('../mails/email');
const { sendSMS } = require('../mails/messages');

// Fetch all queues joined by a user
router.get('/joined/:studentId', async (req, res) => {
    try {
      const studentId = req.params.studentId;
      const queues = await Queue.find({ 'students.studentId': studentId }).populate('students.studentId');
      res.status(200).json(queues);
    } catch (error) {
      console.error('Error fetching joined queues:', error);
      res.status(500).json({ error: 'An error occurred while fetching joined queues' });
    }
  });
  
  

module.exports = router;
