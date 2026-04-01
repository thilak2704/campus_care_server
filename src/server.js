import app from './app.js';
import env from './config/env.js';
import { ensureDatabaseReady } from './db/init.js';

const startServer = async () => {
  await ensureDatabaseReady();

  app.listen(env.port);
};

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
