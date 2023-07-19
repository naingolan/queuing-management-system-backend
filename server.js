const express = require('express');
const cors = require('cors');
const corsOptions ={
   origin:'*', 
   credentials:true,           
   optionSuccessStatus:200,
};


const userRoutes = require('./routes/user-registration');
const queueCreationRoutes = require('./routes/queue-creation');
const queueJoiningRoutes = require('./routes/queue-joining');
const queueNotifications = require('./routes/queue-notifications');
const queueSpecified = require('./routes/queue-specified');
const chats = require('./routes/chats');

const app = express();
app.use(cors(corsOptions)) 

// setitng up the middleware
app.use(express.json());
app.use('/api/users', userRoutes); 
app.use('/api/queues', queueCreationRoutes); 
app.use('/api/queues', queueJoiningRoutes);
app.use('/api/queues', queueNotifications);
app.use('/api/queues', queueSpecified);
app.use('/api/queues', chats);
// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://nainggolan:kevin2001@cluster0.h6vms6z.mongodb.net/queuing-management-system?retryWrites=true&w=majority';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB', error);
  });