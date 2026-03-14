const mongoose = require("mongoose");
require('dotenv').config();

const connectDB = async () => {
  try {
    let raw = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!raw) {
      console.error('MONGODB_URI / MONGO_URI not defined (checked backend/.env)');
      return false;
    }
    const uri = raw.replace(/^"(.*)"$/, '$1').trim();
    await mongoose.connect(uri);
    console.log("MongoDB Connected");
    return true;
  } catch (error) {
    console.log('failed to connect to MongoDB');
    console.error(error.message || error);
    return false;
  }
};

module.exports = connectDB;
