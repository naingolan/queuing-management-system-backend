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
    additionalDesc:{
      type:String,
      required:false
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
      studentName:{
        type: String,
        required: true
      },
      registrationId: {
        type: String,
        
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
      }, 
      status:{
        type: String,
        enum: ['waiting', 'served'],
        default: 'waiting'
      },
      servedAt: {
        type: Date,
      },
    }],
    queueType: {
      type: String,
      enum: ['specified', 'open'],
      default: 'open'
    },
    openingTime: {
      type: Date,
    },
    closingTime: {
      type: Date,
    },
    location: {
      type: String,
    },
    specifiedQueue: [
      {
        registrationId: {
          type: String,
        },
        studentName: {
          type: String
        },
        studentEmail: {
          type: String
        },
        status: {
          type: String,
          enum: ['pending', 'served'],
          default: 'pending'
        },
        servedAt: {
          type: Date
        }
      }
    ]
    
  });

const Queue = mongoose.model('Queue', queueSchema);
module.exports = Queue;

  