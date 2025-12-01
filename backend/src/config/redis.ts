import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

// Connect to Redis
export async function connectRedis() {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
}

// Disconnect from Redis
export async function disconnectRedis() {
  try {
    await redisClient.quit();
  } catch (error) {
    console.error('Failed to disconnect from Redis:', error);
  }
}

export default redisClient;
