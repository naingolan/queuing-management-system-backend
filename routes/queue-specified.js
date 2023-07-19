const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Queue = require('../models/queue');
const User = require('../models/user');
const { sendQueueStatusEmail } = require('../mails/email');
const { sendSMS } = require('../mails/messages');


const multer = require('multer');
const excelParser = require('exceljs');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post('/upload', upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = new excelParser.Workbook();
    const buffer = req.file.buffer;
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(1);
    const rows = worksheet.getRows();

    const specifiedQueue = [];

    for (const row of rows) {
      const registrationId = row.getCell(2).value;
      const studentName = row.getCell(1).value;
      const studentEmail = row.getCell(3).value;
      const phoneNumber = row.getCell(4).value;

      specifiedQueue.push({
        registrationId,
        studentName,
        studentEmail,
        studentPhone: phoneNumber,
        status: 'pending'
      });
    }

    const queue = new Queue({
      specifiedQueue
    });

    const savedQueue = await queue.save();

    res.status(200).json({ message: 'Excel data uploaded successfully', queue: savedQueue });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while uploading the Excel file' });
  }
});

module.exports = router;
