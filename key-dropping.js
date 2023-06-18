const User = require('./models/user'); // Assuming your User model is in a separate file

async function dropIndex() {
  try {
    // Drop the unique index on the "id" field
    await User.collection.dropIndex('id_1', { maxTimeMS: 30000 });


    console.log('Unique index dropped successfully.');
  } catch (error) {
    console.error('Error dropping unique index:', error);
  }
}

dropIndex();
