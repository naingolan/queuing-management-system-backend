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
        studentName: {
          type: String
        },
        studentEmail: {
          type: String
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
          enum: ['waiting', 'served', 'on hold'],
          default: 'waiting'
        },
        servedAt: {
          type: Date,
        },
        phoneNumber: {
          type: String,
        },
      }
    ],
    chats: [
      {
        sender:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: false,
        },
        content: {
          type: String,
        },
        time: {
          type: Date,
          default: Date.now
        },
        receiver: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      }
    ],

    patners:[
      {
        patnerId:{
          ref: 'User',
          type: mongoose.Schema.Types.ObjectId,
        },
        patnerScore:{
          type: Number,
          default: 0
        },
      }
    ]
    
  });

const Queue = mongoose.model('Queue', queueSchema);
module.exports = Queue;

  