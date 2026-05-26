const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/ats_analyzer';
    const conn = await mongoose.connect(connStr, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    // Safe fallback: do not crash server in sandbox mode
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
