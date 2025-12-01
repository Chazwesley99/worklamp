/* eslint-disable @typescript-eslint/no-var-requires */
const redis = require('redis');

async function clearRateLimits() {
  const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  try {
    await client.connect();
    console.log('✅ Connected to Redis');

    // Clear all rate limit keys
    const keys = await client.keys('rl:*');

    if (keys.length > 0) {
      await client.del(keys);
      console.log(`✅ Cleared ${keys.length} rate limit keys`);
    } else {
      console.log('ℹ️  No rate limit keys found');
    }

    console.log('\n💡 Tip: You can also restart the backend server to clear rate limits');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log(
      '\n💡 Rate limits are likely stored in memory. Restart the backend server to clear them.'
    );
  } finally {
    await client.quit();
  }
}

clearRateLimits();
