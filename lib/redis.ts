import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

interface RedisCache {
  client: Redis | null;
}

declare global {
  // eslint-disable-next-line no-var
  var redisCache: RedisCache | undefined;
}

const cached: RedisCache = global.redisCache ?? { client: null };
global.redisCache = cached;

export function getRedisClient(): Redis {
  if (cached.client) return cached.client;

  cached.client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  cached.client.on("error", (err) => {
    console.error("Redis connection error:", err);
  });

  return cached.client;
}

// Cache helpers
const DEFAULT_TTL = 300; // 5 minutes

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setCachedData(
  key: string,
  data: unknown,
  ttl: number = DEFAULT_TTL,
): Promise<void> {
  try {
    const client = getRedisClient();
    await client.set(key, JSON.stringify(data), "EX", ttl);
  } catch (err) {
    console.error("Redis set error:", err);
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch (err) {
    console.error("Redis invalidate error:", err);
  }
}
