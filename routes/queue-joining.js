const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Queue = require('../models/queue');
const User = require('../models/user');
const { sendQueueStatusEmail } = require('../mails/email');
const { sendSMS } = require('../mails/messages');


// Route: Add data to specified queue
router.post('/add/:queueId/specified', async (req, res) => {
  const { queueId } = req.params;
  const students = req.body;

  try {
    // Find the queue by ID
    const queue = await Queue.findById(queueId);

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    // Add each student to the specifiedQueue array
    students.forEach(student => {
      const { Name, Email, RegistrationNumber } = student;
      console.log(RegistrationNumber)
      const specifiedStudent = {
        studentName: Name,
        studentEmail: Email,
        registrationId: RegistrationNumber,
      };
      queue.specifiedQueue.push(specifiedStudent);
    });

    // Save the updated queue
    await queue.save();

    res.status(200).json({ message: 'Specified students added successfully' });
  } catch (error) {
    console.log('Error adding specified students:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

// Student joins a queue
router.post('/add/:queueId/join/:studentId',  async (req, res) => {
  try {
    // Check if the user has the "student" role
    // if (req.user.role !== 'student') {
    //   return res.status(403).json({ error: 'Only students can join a queue' });
    // }

    // Find the queue by ID
    const queue = await Queue.findById(req.params.queueId);

    if (!queue) {
      return res.status(404).json({ error: 'Queue not found' });
    }

    // Check if the student has already joined the queue
    const isJoined = queue.students.some(student => student.studentId.toString() === req.params.studentId);

    if (isJoined) {
      return res.status(400).json({ error: 'You have already joined this queue' });
    }

    // Find the student by ID
    const student = await User.findById(req.params.studentId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Add the student to the queue
    console.log(student.name)
    queue.students.push({
      studentId: student._id,
      studentName: student.name,
      registrationId: student.registrationId,
      joiningTime: new Date(),
      coupon: Math.floor(1000 + Math.random() * 9000) // Generate a random coupon
    });

    // Save the updated queue
    const updatedQueue = await queue.save();

    res.status(200).json(updatedQueue);
//Dealing with time first
const timestamp = queue.students[queue.students.length - 1].joiningTime

const date = new Date(timestamp);

const options = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
};

const formattedDate = date.toLocaleDateString('en-US', options);
const formattedTime = date.toLocaleTimeString('en-US', options);

const formattedDateTime = `${formattedDate} ${formattedTime}`;
console.log(formattedDateTime); // Output: Monday 7 June 2023 13:00

    // Prepare email data
  const email = student.email; // Replace with the actual email property
  const subjectContent = 'Queue Join Confirmation'; // Replace with the desired subject content
  const templateData = {
  studentName: student.name,
  queueName: queue.name,
  coupon: queue.students[queue.students.length - 1].coupon, 
  time: queue.students[queue.students.length - 1].joiningTime
  // Include any other relevant data for the email template
};

// Send queue status email
sendQueueStatusEmail(email, subjectContent, templateData);

// Sendng SMS
const recipientNumber = '+255758224960'; 
const message = `Dear ${student.name}, you have joined the queue ${queue.name.toUpperCase()}  at ${formattedDate} 
                 with coupon 
                ${queue.students[queue.students.length - 1].coupon}. 
                You will be informed shortly when your turn approaches.`
sendSMS(recipientNumber, message);

  } catch (error) {
    console.error('Error joining queue:', error);
    res.status(500).json({ error: 'An error occurred while joining the queue' });
  }
});


// Student leaves a queue
router.post('/leave/:queueId/:studentId',  async (req, res) => {
  try {

    const { queueId, studentId } = req.params;

    // Find the queue by ID
    const queue = await Queue.findById(queueId);

    if (!queue) {
      return res.status(404).json({ error: 'Queue not found' });
    }

    // Check if the student has joined the queue
    const studentIndex = queue.students.findIndex(student => student.studentId.toString() === studentId);

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

//Drop me by 5 steps
// Student requests to be moved down the list
router.post('/move-down/:queueId/:studentId/:positions',  async (req, res) => {
  try {

    const { queueId, studentId, positions } = req.params;

    // Convert positions to a number
    const numPositions = parseInt(positions, 10);

    // Find the queue by ID
    const queue = await Queue.findById(queueId);

    if (!queue) {
      return res.status(404).json({ error: 'Queue not found' });
    }

    // Check if the queue has at least 2 members
    if (queue.students.length < 2) {
      return res.status(400).json({ error: 'The queue must have at least 2 members' });
    }

    // Find the student's index in the queue
    const studentIndex = queue.students.findIndex(student => student.studentId.toString() === studentId);


    // Check if the student is at the last position
   if (studentIndex>= queue.students.length - 1) {
          return res.status(400).json({ error: 'You are already at the last position and cannot be moved further down' });
     }

    if (studentIndex === -1) {
      return res.status(400).json({ error: 'You are not in this queue' });
    }

    // Calculate the new index based on the requested number of positions to move down
    const newIndex = Math.max(studentIndex + numPositions, 0); // Ensure the new position is within the valid range
    const student = await User.findById(req.params.studentId);

    // Move the student down the list
    queue.students.splice(studentIndex, 1);
    queue.students.splice(newIndex, 0, {
      studentId: studentId,
      name: student.name,
      joiningTime: new Date(),
      coupon: Math.floor(1000 + Math.random() * 9000)
    });

    // Save the updated queue
    const updatedQueue = await queue.save();

    res.status(200).json(updatedQueue);
  } catch (error) {
    console.error('Error moving down the list:', error);
    res.status(500).json({ error: 'An error occurred while moving down the list' });
  }
});

//


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
router.get('/queues',  async (req, res) => {
  try {

    // Find all queues
    const queues = await Queue.find();

    res.status(200).json(queues);
  } catch (error) {
    console.error('Error getting queues:', error);
    res.status(500).json({ error: 'An error occurred while getting the queues' });
  }
});

// Function to notify student at a specific position
function notifyStudentAtPosition(position, queue, waitingStudents) {
  if (position <= waitingStudents.length) {
    const student = waitingStudents[position - 1];
    const recipient = "+255758224960";
    const message = `Hi ${student.name}, you are number ${position} in the queue. Please get ready.`;
    sendSMS(recipient, message);

    const email = "kelvinsdechaw@gmail.com";
    if(position == 1){
      const subjectContent = 'Your turn is now!!';
    }else{
    const subjectContent = 'Your turn is approaching';
    }
    const templateData = {
      name: student.name,
      position: position,
      queueName: queue.name
    };
    const subjectContent = 'Your turn is approaching';
    sendQueueStatusEmail(email, 'Your turn is approaching', templateData);
  }
}

// Usage example
router.patch('/:queueId/students/:studentId', async (req, res) => {
  try {
    const { queueId, studentId } = req.params;

    // Find the queue by ID
    const queue = await Queue.findById(queueId);

    if (!queue) {
      return res.status(404).json({ error: 'Queue not found' });
    }

    // Find the student in the queue by ID
    const student = queue.students.find(student => student._id.toString() === studentId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Update the student's status to "served"
    student.status = 'served';
    student.servedAt = new Date();

    // Save the updated queue
    const updatedQueue = await queue.save();

    // Get the students with the status of "waiting"
    const waitingStudents = queue.students.filter(student => student.status === 'waiting');

    // Notify student at position 3
    notifyStudentAtPosition(3, queue, waitingStudents);

    // Notify student at position 5
    notifyStudentAtPosition(5, queue, waitingStudents);

    // Notify student at position 10
    notifyStudentAtPosition(10, queue, waitingStudents);

    res.status(200).json(updatedQueue);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while updating the student status' });
  }
});

router.patch('/close-queue/:queueId', async (req, res) => {
  try {
    const { queueId } = req.params;
    const { description, status } = req.body;

    // Find the queue by ID
    const queue = await Queue.findById(queueId);

    if (!queue) {
      return res.status(404).json({ error: 'Queue not found' });
    }

    // Update the queue's description and status
    queue.additionalDesc = description;
    if(status == "closed")
    queue.status = status;

    // Save the updated queue
    const updatedQueue = await queue.save();

    res.status(200).json(updatedQueue);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while closing the queue' });
  }
});


module.exports = router;
