const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config');
const authMiddleware = require('../middleware/auth');

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

module.exports = router;
