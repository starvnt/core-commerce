const mongoose = require('mongoose');

/**
 * Resolves a working Mongo URI.
 *
 * If MONGO_URI is set in env, use it directly (local install, Atlas, Docker, etc.).
 * Otherwise — when ALLOW_MEMORY_DB=1 — spin up an in-process mongod via
 * mongodb-memory-server. This is convenient for Day 1 dev when the team hasn't
 * installed Mongo locally yet, but it is NOT intended for production.
 */
async function resolveMongoUri() {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;

  if (process.env.ALLOW_MEMORY_DB === '1') {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mem = await MongoMemoryServer.create();
    const uri = mem.getUri('starvnt_core');
    console.log(`[db] Using in-memory MongoDB at ${uri}`);
    return uri;
  }

  throw new Error(
    'MONGO_URI is not set. Either define MONGO_URI in server/.env, ' +
      'or set ALLOW_MEMORY_DB=1 to use an in-process MongoDB for local dev.',
  );
}

async function connectDB() {
  const uri = await resolveMongoUri();

  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    console.log(`[db] MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  });
  mongoose.connection.on('error', (err) => {
    console.error('[db] MongoDB connection error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected');
  });

  await mongoose.connect(uri);
}

module.exports = connectDB;
