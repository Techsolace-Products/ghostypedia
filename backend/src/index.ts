import express, { Application } from 'express';
import { config } from './config/env';
import { checkDatabaseHealth, closeDatabaseConnection } from './config/database';
import { connectRedis, disconnectRedis, checkRedisHealth } from './config/redis';

const app: Application = express();
const PORT = config.port;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
import apiRoutes from './routes';

// Mount API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', async (_req, res) => {
  const dbHealthy = await checkDatabaseHealth();
  const redisHealthy = await checkRedisHealth();
  
  const status = dbHealthy && redisHealthy ? 'ok' : 'degraded';
  const statusCode = dbHealthy && redisHealthy ? 200 : 503;
  
  res.status(statusCode).json({
    status,
    message: 'Ghostypedia Backend',
    services: {
      database: dbHealthy ? 'healthy' : 'unhealthy',
      redis: redisHealthy ? 'healthy' : 'unhealthy',
    },
  });
});

// Initialize connections and start server
async function startServer() {
  try {
    // Connect to Redis
    await connectRedis();
    console.log('Redis connected successfully');
    
    // Check database connection
    const dbHealthy = await checkDatabaseHealth();
    if (dbHealthy) {
      console.log('Database connected successfully');
    } else {
      console.warn('Database connection check failed');
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown() {
  console.log('Shutting down gracefully...');
  try {
    await disconnectRedis();
    await closeDatabaseConnection();
    console.log('Connections closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();

export default app;
