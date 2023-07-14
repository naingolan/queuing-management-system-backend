const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Queue = require('../models/queue');

router.post('/add', async (req, res) => {
  try {
    const { name, description, location, openingTime, closingTime, queueType, creatorId } = req.body;

    // Convert openingTime and closingTime strings to Date objects
    const openingTimeParts = openingTime.split(":");
    const closingTimeParts = closingTime.split(":");
    const openingTimeDate = new Date();
    const closingTimeDate = new Date();

    openingTimeDate.setHours(parseInt(openingTimeParts[0]));
    openingTimeDate.setMinutes(parseInt(openingTimeParts[1]));
    closingTimeDate.setHours(parseInt(closingTimeParts[0]));
    closingTimeDate.setMinutes(parseInt(closingTimeParts[1]));

    // Create a new queue object with the updated Date objects
    const queue = new Queue({
      name,
      description,
      status: 'open',
      creator: creatorId,
      students: [],
      location,
      openingTime: openingTimeDate,
      closingTime: closingTimeDate,
      queueType: queueType
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


// Fetch queues created by a user
router.get('/created/:userId', async (req, res) => {
  try {
    const queues = await Queue.find({ creator: req.params.userId });
    res.status(200).json(queues);
  } catch (error) {
    console.error('Error fetching queues:', error);
    res.status(500).json({ error: 'An error occurred while fetching queues' });
  }
});


module.exports = router;
