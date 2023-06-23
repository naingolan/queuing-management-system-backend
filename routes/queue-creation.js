const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Queue = require('../models/queue');

// Create a new queue
router.post('/add', authMiddleware("staff"), async (req, res) => {
  try {
    if (req.user.role !== 'staff') {
      return res.status(403).json({ error: 'Only staff members can create queues' });
    }
    // Extract the necessary data from the request body
    const { name, description } = req.body;

    // Create a new queue object
    const queue = new Queue({
      name,
      description,
      status: 'open',
      creator: req.user.userId,
      students: []
    });

    // Save the new queue in the database
    const createdQueue = await queue.save();

    res.status(201).json(createdQueue);
  } catch (error) {
    console.error('Error creating queue:', error);
    res.status(500).json({ error: 'An error occurred while creating the queue' });
  }
});

// Delete a queue
router.delete('/delete/:id', authMiddleware, async (req, res) => {
  try {
    // Check if the user has the "staff" role
    if (req.user.role !== 'staff') {
      return res.status(403).json({ error: 'Only staff members can delete queues' });
    }

    // Find the queue by ID and delete it
    const deletedQueue = await Queue.findByIdAndDelete(req.params.id);

    if (!deletedQueue) {
      return res.status(404).json({ error: 'Queue not found' });
    }

    res.status(200).json({ message: 'Queue deleted successfully' });
  } catch (error) {
    console.error('Error deleting queue:', error);
    res.status(500).json({ error: 'An error occurred while deleting the queue' });
  }
});

// Update a queue
router.put('/update/:id', authMiddleware, async (req, res) => {
  try {
    // Check if the user has the "staff" role
    if (req.user.role !== 'staff') {
      return res.status(403).json({ error: 'Only staff members can update queues' });
    }

    // Find the queue by ID and update it
    const updatedQueue = await Queue.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedQueue) {
      return res.status(404).json({ error: 'Queue not found' });
    }

    res.status(200).json(updatedQueue);
  } catch (error) {
    console.error('Error updating queue:', error);
    res.status(500).json({ error: 'An error occurred while updating the queue' });
  }
});

//Get all queues 
router.get('/all', async (req, res) => {
  try {
    // Retrieve all queues from the database
    const queues = await Queue.find();

    res.status(200).json(queues);
  } catch (error) {
    console.error('Error retrieving queues:', error);
    res.status(500).json({ error: 'An error occurred while retrieving the queues' });
  }
});

// Get a queue by ID
router.get('/queues/:id',  async (req, res) => {
  try {
    // Find the queue by ID
    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({ error: 'Queue not found' });
    }

    res.status(200).json(queue);
  } catch (error) {
    console.error('Error retrieving queue:', error);
    res.status(500).json({ error: 'An error occurred while retrieving the queue' });
  }
});

module.exports = router;
