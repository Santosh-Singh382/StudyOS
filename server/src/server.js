import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

function main() {
  connectDB();

  const server = app.listen(env.port, () => {
    console.log(`StudyOS API listening on http://localhost:${env.port}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received — shutting down.`);
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main();