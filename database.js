const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://rathnabhoomidevelopers_db_user:Z9dzxSCfjlSYZNkL@rbdcrm.rk7usja.mongodb.net/navanagara');
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
