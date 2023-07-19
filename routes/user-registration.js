const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config');
const authMiddleware = require('../middleware/auth');
const nodemailer = require('nodemailer');


// User registration route
router.post('/register', async (req, res) => {
  try {
    const { name,  email, registrationId, password, role } = req.body;
    // Check if the username or email already exists in the database
    const existingUser = await User.findOne({ $or: [{ registrationId }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Registration ID or email already exists' });
    }
    console.log(req.body);
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user with the default role of "student"
    const user = new User({
      registrationId,
      name,
      email,
      password: hashedPassword,
      role
    });

    // Save the user to the database
    await user.save();
    const token = jwt.sign({ userId: User._id, role: User.role }, config.jwtSecret);

    //res.status(201).json({ message: 'User registered successfully', userId: user.id, token });

    res.status(201).json({
      token,
      userId: user._id,
      userRole: user.role,
      registrationId: user.registrationId,
      userName: user.name,
      userEmail: user.email,
    });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'An error occurred while registering the user' });
  }
});
router.post('/login', async (req, res) => {
  const { registrationId, email, password } = req.body;

  // Check if username or email is provided
  if (!registrationId && !email) {
    return res.status(400).json({ error: 'Please provide a username or email' });
  }

  try {
    let user;

    // Check if username is provided and find the user by username
    if (email) {
      user = await User.findOne({ email });
    }

    // If user is not found and email is provided, find the user by email
    if (!user && email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the user's hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT token and send it to the client

    token = jwt.sign({ userId: User.id, role: User.role }, config.jwtSecret);

    res.status(200).json({
      token,
      userId: user._id,
      userRole: user.role,
      registrationId: user.registrationId,
      userName: user.name,
      userEmail: user.email,
    });

  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'An error occurred during login' });
  }
});

//Get user data
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(userId)
    // Find the user by the provided userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return the user data
    res.status(200).json({
      userId: user.id,
      userRole: user.role,
      registrationId: user.registrationId,
      userName: user.name,
      userEmail: user.email,
    });
    console.log(user);
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return res.status(500).json({ error: 'An error occurred while retrieving user data' });
  }
});


// Route to get all users with role of "student"
router.get('/', async (req, res) => {
  try {
    const users = await User.find();

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route suspend user
router.put('/suspend/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if(user.status == 'inactive'){
      user.status = 'active';
    }else{
    user.status = 'inactive';
    }
    await user.save(); 
    res.json({ message: 'User suspended successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Route to create a staff account
router.post('/createStaff', async (req, res) => {
  try {
    const { name, email, registrationId, password, role } = req.body;

    // Check if the username or email already exists in the database
    const existingUser = await User.findOne({ $or: [{ email }, { registrationId }] });
    if (existingUser) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Create a new staff user
    const staffUser = new User({
      name,
      email,
      registrationId,
      password,
      role: 'staff',
    });

    // Save the staff user to the database
    await staffUser.save();

    sendAccountCreationEmail(staffUser.email, staffUser.name);
    res.status(201).json({ message: 'Staff account created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.patch('/update/staff/password', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(password);
    // Find the staff by email
    const staff = await User.findOne({ email });

    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Generate a new salt
    const salt = await bcrypt.genSalt(10);

    // Update the staff's password
    staff.password = await bcrypt.hash(password, salt);

    // Save the updated staff
    const updatedStaff = await staff.save();

    res.status(200).json(updatedStaff);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while updating the password' });
  }
});


//Email to inform a staff about account creation
async function sendRegistrationConfirmationEmail(email) {
  try {
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'kinegaofficial@gmail.com',
        pass: 'buzpitfowyqigedj',
      },
    });

    let mailOptions = {
      from: 'kinegaofficial@gmail.com',
      to: email,
      subject: 'Registration Confirmation',
      text: 'Thank you for registering. Your account has been successfully created.',
    };

    let info = await transporter.sendMail(mailOptions);

    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

//funciton for staff login
async function sendAccountCreationEmail(email, name) {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'kinegaofficial@gmail.com',
        pass: 'buzpitfowyqigedj',
      },
    });

    const subjectContent = 'Account Created - Action Required';
    const changePasswordLink = 'http://localhost:4200/change-password'; 
    const loginLink = 'http://localhost:4200/login'; 

    const htmlContent = `
      <h2 style="background-color:blue; color:white">IFM QUEUING MANAGEMENT SYSTEM</h2>
      <h3>Account Creation Notification</h3>
      <p>Dear ${name},</p>
      <p>Your account has been successfully created. Please follow the steps below to activate your account:</p>
      <ol>
        <li>Click <a href="${changePasswordLink}">here</a> to change your password.</li>
        <li>Once you have changed your password, you can login using the following link: <a href="${loginLink}">Login</a></li>
      </ol>
      <p>If you did not create an account, please contact us immediately.</p>
      <p>Thank you.</p>
    `;

    let mailOptions = {
      from: 'kinegaofficial@gmail.com',
      to: email,
      subject: subjectContent,
      html: htmlContent,
    };

    let info = await transporter.sendMail(mailOptions);

    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}




module.exports = router;
