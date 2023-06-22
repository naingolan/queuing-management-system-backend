const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  registrationId: {
    type: String,
  },
  password: {
    type: String,
    require: true,
    },

  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'student'],
    default: 'student'
  },
  id: {
    type: mongoose.Schema.Types.UUID,
    default: mongoose.Types.UUID.generate,
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
