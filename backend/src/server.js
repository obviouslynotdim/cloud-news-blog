const env = require('./config/env');
const { createApp } = require('./app');
const { initDatabase } = require('../database');

async function startServer() {
  await initDatabase();

  const app = createApp();
  app.listen(env.port, '0.0.0.0', () => {
    console.log(`Backend running on port ${env.port}`);
    if (process.env.DATABASE_URL) {
      console.log('Using PostgreSQL storage');
    } else {
      console.log('Using local JSON storage');
    }
  });
}

startServer().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
