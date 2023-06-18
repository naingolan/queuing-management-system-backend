const mongoose = require('mongoose');
const queueSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: false
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open'
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    students: [{
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      joiningTime: {
        type: Date,
        default: Date.now
      },
      description: {
        type: String,
        required: false
      },
      course: {
        type: String,
        required: false
      },
      coupon: {
        type: String,
        default: () => Math.random().toString(36).substr(2, 8) // Generate a random coupon
      }
    }],
    kind: {
      type: String,
      enum: ['specified', 'custom'],
      default: 'specified'
    }
  });

const Queue = mongoose.model('Queue', queueSchema);
module.exports = Queue;

  