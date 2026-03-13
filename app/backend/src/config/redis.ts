import { createClient, RedisClientType } from 'redis';
import { env } from './env.js';

let redisClient: RedisClientType | null = null;
let pubClient: RedisClientType | null = null;
let subClient: RedisClientType | null = null;

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (!redisClient) {
    redisClient = createClient({
      url: env.redisUrl,
      password: env.redisPassword || undefined,
    });

    redisClient.on('error', (err) => console.error('Redis Client Error:', err));
    redisClient.on('connect', () => console.log('Redis Client Connected'));

    await redisClient.connect();
  }
  return redisClient;
};

export const getPubClient = async (): Promise<RedisClientType> => {
  if (!pubClient) {
    pubClient = createClient({
      url: env.redisUrl,
      password: env.redisPassword || undefined,
    });
    await pubClient.connect();
  }
  return pubClient;
};

export const getSubClient = async (): Promise<RedisClientType> => {
  if (!subClient) {
    subClient = createClient({
      url: env.redisUrl,
      password: env.redisPassword || undefined,
    });
    await subClient.connect();
  }
  return subClient;
};

// Presence helpers
export const PRESENCE_PREFIX = 'presence:';
export const TYPING_PREFIX = 'typing:';
export const ONLINE_USERS_SET = 'online_users';

export const setUserOnline = async (userId: string, socketId: string): Promise<void> => {
  const client = await getRedisClient();
  await Promise.all([
    client.sAdd(ONLINE_USERS_SET, userId),
    client.hSet(`${PRESENCE_PREFIX}${userId}`, {
      status: 'online',
      socketId,
      lastSeen: Date.now().toString(),
    }),
  ]);
};

export const setUserOffline = async (userId: string): Promise<void> => {
  const client = await getRedisClient();
  await Promise.all([
    client.sRem(ONLINE_USERS_SET, userId),
    client.hSet(`${PRESENCE_PREFIX}${userId}`, {
      status: 'offline',
      lastSeen: Date.now().toString(),
    }),
  ]);
};

export const getUserPresence = async (userId: string): Promise<Record<string, string> | null> => {
  const client = await getRedisClient();
  return client.hGetAll(`${PRESENCE_PREFIX}${userId}`);
};

export const getOnlineUsers = async (userIds: string[]): Promise<string[]> => {
  const client = await getRedisClient();
  const pipeline = client.multi();
  userIds.forEach((id) => pipeline.sIsMember(ONLINE_USERS_SET, id));
  const results = await pipeline.exec();
  return userIds.filter((_, i) => results[i]);
};

// Typing indicators
export const setTyping = async (
  conversationId: string,
  userId: string,
  userName: string
): Promise<void> => {
  const client = await getRedisClient();
  const key = `${TYPING_PREFIX}${conversationId}`;
  await client.hSet(key, userId, JSON.stringify({ name: userName, timestamp: Date.now() }));
  await client.expire(key, 10); // Auto-expire after 10 seconds
};

export const clearTyping = async (conversationId: string, userId: string): Promise<void> => {
  const client = await getRedisClient();
  await client.hDel(`${TYPING_PREFIX}${conversationId}`, userId);
};

export const getTypingUsers = async (conversationId: string): Promise<Array<{ userId: string; name: string }>> => {
  const client = await getRedisClient();
  const typing = await client.hGetAll(`${TYPING_PREFIX}${conversationId}`);
  const now = Date.now();
  const result: Array<{ userId: string; name: string }> = [];
  
  for (const [userId, data] of Object.entries(typing)) {
    const parsed = JSON.parse(data);
    // Only include if typing timestamp is within 5 seconds
    if (now - parsed.timestamp < 5000) {
      result.push({ userId, name: parsed.name });
    }
  }
  
  return result;
};

export const closeRedis = async (): Promise<void> => {
  await Promise.all([
    redisClient?.quit(),
    pubClient?.quit(),
    subClient?.quit(),
  ]);
  redisClient = null;
  pubClient = null;
  subClient = null;
};
