const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const rawConnStr = process.env.MONGO_URI;
    const connStr = rawConnStr?.startsWith('MONGO_URI=')
      ? rawConnStr.slice('MONGO_URI='.length)
      : rawConnStr;

    if (!connStr) {
      throw new Error('MONGO_URI is not defined');
    }

    if (/[<>]/.test(connStr)) {
      throw new Error(
        'MONGO_URI still contains placeholder brackets. Replace <your-password> with the real MongoDB Atlas password and URL-encode any special characters in the username or password.'
      );
    }

    const conn = await mongoose.connect(connStr);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} | DB: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
