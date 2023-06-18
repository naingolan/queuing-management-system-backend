const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Queue = require('../models/queue');

// Student joins a queue
router.post('/queues/:id/join', authMiddleware, async (req, res) => {
  try {
    // Check if the user has the "student" role
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can join a queue' });
    }

    // Find the queue by ID
    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({ error: 'Queue not found' });
    }

    // Check if the student has already joined the queue
    const isJoined = queue.students.some(student => student.studentId.toString() === req.user.userId);

    if (isJoined) {
      return res.status(400).json({ error: 'You have already joined this queue' });
    }

    // Add the student to the queue
    queue.students.push({
      studentId: req.user.userId,
      name: req.user.name,
      joiningTime: new Date(),
      coupon: Math.floor(1000 + Math.random() * 9000) // Generate a random coupon
    });

    // Save the updated queue
    const updatedQueue = await queue.save();

    res.status(200).json(updatedQueue);
  } catch (error) {
    console.error('Error joining queue:', error);
    res.status(500).json({ error: 'An error occurred while joining the queue' });
  }
});

// Student leaves a queue
router.post('/queues/:id/leave', authMiddleware, async (req, res) => {
  try {
    // Check if the user has the "student" role
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can leave a queue' });
    }

    // Find the queue by ID
    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({ error: 'Queue not found' });
    }

    // Check if the student has joined the queue
    const studentIndex = queue.students.findIndex(student => student.studentId.toString() === req.user.userId);

    if (studentIndex === -1) {
      return res.status(400).json({ error: 'You have not joined this queue' });
    }

    // Remove the student from the queue
    queue.students.splice(studentIndex, 1);

    // Save the updated queue
    const updatedQueue = await queue.save();

    res.status(200).json(updatedQueue);
  } catch (error) {
    console.error('Error leaving queue:', error);
    res.status(500).json({ error: 'An error occurred while leaving the queue' });
  }
});

// Update a queue
router.put('/queues/:id', authMiddleware, async (req, res) => {
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

// Get a list of queues
router.get('/queues', authMiddleware, async (req, res) => {
  try {
    // Check if the user has the "student" role
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can get the list of queues' });
    }

    // Find all queues
    const queues = await Queue.find();

    res.status(200).json(queues);
  } catch (error) {
    console.error('Error getting queues:', error);
    res.status(500).json({ error: 'An error occurred while getting the queues' });
  }
});

module.exports = router;
