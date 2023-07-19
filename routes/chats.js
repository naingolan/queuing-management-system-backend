const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Queue = require('../models/queue');


router.post('/staff-chats/:id', async (req, res) => {
    try {
      const queueId = req.params.id;
      const { content, receiver } = req.body;
  
      // Find the queue by ID
      const queue = await Queue.findById(queueId);
  
      // Verify that the queue exists
      if (!queue) {
        return res.status(404).json({ error: 'Queue not found' });
      }
  
      // Create the chat message object
      const chatMessage = {
        content,
        receiver,
        time: Date.now()
      };
  
      // Add the chat message to the queue's chat array
      queue.chats.push(chatMessage);
  
      // Save the updated queue
      await queue.save();
  
      // Return the updated queue as the response
      res.json(queue);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  router.get('/staff-chats/:id', async (req, res) => {
    try {
      const queueId = req.params.id;
  
      // Find the queue by ID and populate the 'chats.receiver' field with the User model
      const queue = await Queue.findById(queueId).populate('chats.receiver', 'name');
  
      // Verify that the queue exists
      if (!queue) {
        return res.status(404).json({ error: 'Queue not found' });
      }
  
      // Retrieve the chat messages from the queue's chat array and format the response
      const chatMessages = queue.chats.map(chat => ({
        content: chat.content,
        time: chat.time,
        sender: chat.sender, 
        receiver: chat.receiver._id,
        receiverName: chat.receiver.name // Assuming 'name' is the field in the User model
      }));
  
      // Return the chat messages as the response
      res.json(chatMessages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


  router.post('/user-chats/:id', async (req, res) => {
    try {
      const queueId = req.params.id;
      const { sender, content, receiver } = req.body;
  
      // Find the queue by ID
      const queue = await Queue.findById(queueId);
  
      // Verify that the queue exists
      if (!queue) {
        return res.status(404).json({ error: 'Queue not found' });
      }
      console.log(sender);
      // Create the chat message object
      const chatMessage = {
        sender,
        content,
        receiver,
        time: Date.now()
      };
  
      // Add the chat message to the queue's chat array
      queue.chats.push(chatMessage);
  
      // Save the updated queue
      await queue.save();
  
      // Return the updated queue as the response
      res.json(queue);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
  

  module.exports = router;