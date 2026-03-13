import { createServer } from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { initializeSocket } from './config/socket.js';
import { getRedisClient } from './config/redis.js';
import { ensureBucket } from './config/minio.js';

async function bootstrap() {
  // Connect to MongoDB
  await connectDatabase();
  
  // Create HTTP server from Express app
  const httpServer = createServer(app);
  
  // Initialize Socket.IO
  try {
    await initializeSocket(httpServer);
    console.log('Socket.IO initialized');
  } catch (error) {
    console.error('Socket.IO initialization error:', error);
  }
  
  // Connect to Redis (optional - for presence/typing)
  try {
    await getRedisClient();
    console.log('Redis connected');
  } catch (error) {
    console.warn('Redis not available:', error);
  }
  
  // Ensure MinIO bucket exists (optional - for media storage)
  try {
    await ensureBucket();
    console.log('MinIO bucket ready');
  } catch (error) {
    console.warn('MinIO not available:', error);
  }
  
  // Start the server
  httpServer.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
    console.log(`Environment: ${env.nodeEnv}`);
  });
}

bootstrap().catch(console.error);
