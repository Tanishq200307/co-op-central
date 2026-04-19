const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const logger = require('../utils/logger');

let memoryServer;

async function connectDB() {
  try {
    let mongoUri = process.env.MONGO_URI;
    let usingMemoryServer = false;

    if (!mongoUri) {
      memoryServer = await MongoMemoryServer.create();
      mongoUri = memoryServer.getUri();
      usingMemoryServer = true;
      logger.info('Using in-memory MongoDB for demo mode.');
    }

    await mongoose.connect(mongoUri);
    logger.info('MongoDB connected successfully.');
    return { usingMemoryServer };
  } catch (error) {
    logger.error('MongoDB connection failed.', { error: error.message });
    process.exit(1);
  }
}

async function closeDB() {
  await mongoose.connection.close();
  if (memoryServer) {
    await memoryServer.stop();
  }
}

module.exports = { connectDB, closeDB };
