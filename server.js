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

const app = express();
app.use(cors(corsOptions)) 

// setitng up the middleware
app.use(express.json());
app.use('/api/users', userRoutes); 
app.use('/api/queues', queueCreationRoutes); 
app.use('/api/queues', queueJoiningRoutes);

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