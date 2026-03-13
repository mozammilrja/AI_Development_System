import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';

async function bootstrap() {
  await connectDatabase();
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

bootstrap().catch(console.error);
