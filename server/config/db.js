const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const logger = require('../utils/logger');

let memoryServer;

async function connectWithUri(uri, mode) {
  const startedAt = Date.now();
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
  logger.info(`[db] mode = ${mode}`);
  logger.info(`[db] connected in ${Date.now() - startedAt}ms`);
  return mode;
}

async function connectDB() {
  logger.info('[db] connecting...');
  const preferredUri = process.env.MONGO_URI?.trim();

  if (preferredUri) {
    try {
      const mode = await connectWithUri(preferredUri, 'external');
      return { usingMemoryServer: false, mode };
    } catch (error) {
      logger.warn('[db] external connection failed, falling back to memory', {
        error: error.message,
      });
      await mongoose.disconnect().catch(() => {});
    }
  }

  try {
    memoryServer = await MongoMemoryServer.create();
    const mongoUri = memoryServer.getUri();
    const mode = await connectWithUri(mongoUri, 'memory-server');
    return { usingMemoryServer: true, mode };
  } catch (error) {
    logger.error('[db] memory-server failed to boot', { error: error.message });
    throw error;
  }
}

async function closeDB() {
  await mongoose.connection.close();
  if (memoryServer) {
    await memoryServer.stop();
  }
}

module.exports = { connectDB, closeDB };
