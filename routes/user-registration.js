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
    const { username, name,  email, password, role, id } = req.body;

    // Check if the username or email already exists in the database
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the default role of "student"
    const user = new User({
      id,
      username,
      name,
      email,
      password: hashedPassword,
      role
    });

    // Save the user to the database
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'An error occurred while registering the user' });
  }
});
router.post('/login', async (req, res) => {
    const { identifier, password } = req.body;
  
    try {
      // Find the user by email, username, or studentId
      const user = await User.findOne({
        $or: [
          { email: identifier },
          { username: identifier },
          { studentId: identifier }
        ]
      });
  
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      // Compare the provided password with the user's hashed password
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      // Generate a JWT token and send it to the client
      const token = jwt.sign({ userId: user._id, role: user.role }, config.jwtSecret);
  
      return res.status(200).json({ token });
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).json({ error: 'An error occurred during login' });
    }
  });
module.exports = router;
