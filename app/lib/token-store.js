const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL,
  token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN,
});

module.exports = {
  // Get Supabase tokens for a user
  getSupabaseUser: async function (userId) {
    const key = `supabase:user:${userId}`;
    const raw = await redis.get(key);

    if (!raw) {
      console.log("Supabase user token not found in Redis");
      throw new Error("User not found");
    }

    return raw;
  },

  // Insert or update Supabase tokens, add state
  upsertSupabaseUser: async function ( userId, accessToken, refreshToken, expiresAt) {
    const isValid = Boolean(
      //typeof state === 'string' &&
      typeof userId === 'string' &&
      typeof accessToken === 'string' &&
      typeof refreshToken === 'string' &&
      typeof expiresAt === 'number'
    );

    if (!isValid) {
      return Promise.reject('Invalid Supabase user input');
    }

    const key = `supabase:user:${userId}`;
    const value = JSON.stringify({ accessToken, refreshToken, expiresAt });

    // Set with a TTL of 1 hour (3600 seconds)
    await redis.set(key, value, { ex: 3600 });
  },

  // Update just part of the stored user data
  updateSupabaseUser: async function (userId, updates) {
    const key = `supabase:user:${userId}`;
    const current = await redis.get(key);
    if (!current) return Promise.reject('User not found');

    const existing = JSON.parse(current);
    const updated = { ...existing, ...updates };
    await redis.set(key, JSON.stringify(updated), { ex: 3600 });
  },

  // Remove access token only
  logoutSupabaseUser: async function (userId) {
    const key = `supabase:user:${userId}`;
    const current = await redis.get(key);
    if (!current) return Promise.reject('User not found');

    const parsed = JSON.parse(current);
    delete parsed.accessToken;

    await redis.set(key, JSON.stringify(parsed), { ex: 3600 });
  },

  // Delete user from Redis
  deleteSupabaseUser: async function (userId) {
    await redis.del(`supabase:user:${userId}`);
  },
};
