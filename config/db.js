const mongoose = require('mongoose');

const connectDB = async (retries = 5, delay = 3000) => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(uri, {
        // Modern mongoose options
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 2,
      });

      console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

      // Connection lifecycle events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB error:', err.message);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔁 MongoDB reconnected');
      });

      // Graceful close on app shutdown
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed due to app termination');
        process.exit(0);
      });

      return conn;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt === retries) {
        // Keep the driver's final reason visible (DNS, credentials, IP allowlist, etc.).
        throw new Error(`Could not connect to MongoDB after ${retries} attempts: ${error.message}`, { cause: error });
      }
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

module.exports = connectDB;
