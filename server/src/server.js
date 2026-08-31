require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config');

async function start() {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`[server] StarVnt Core API listening on http://localhost:${port}`);
      console.log(`[server] Health check: http://localhost:${port}/api/health`);
    });
  } catch (err) {
    console.error('[server] Failed to start:', err.message);
    process.exit(1);
  }
}

start();

process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled promise rejection:', reason);
});
