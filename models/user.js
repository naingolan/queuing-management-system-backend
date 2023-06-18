const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  id: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    require: true,
    },

  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'student'],
    default: 'student'
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
