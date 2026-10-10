// seed.js — load 100 fake posts into the leaderboard so you have data to rank.
// Run with:  npm run seed
//
// Each post needs BOTH:
//   - a hash  post:<id>:meta  with title + author
//   - a member in the sorted set trending:posts with a random starting score
//
// Use ONE pipeline for all the writes (200 commands, one round trip).

import { redis } from "./leaderboard.js";

async function seed() {
  try {
    await redis.del("trending:posts");

    const pipeline = redis.pipeline();

    for (let i = 1; i <= 100; i += 1) {
      const id = `post:${i}`;
      const metadataKey = `${id}:meta`;
      const score = Math.floor(Math.random() * 50);

      pipeline.hset(metadataKey, "title", `Post number ${i}`, "author", `@user${i}`);
      pipeline.zadd("trending:posts", score, id);
    }

    const results = await pipeline.exec();

    for (const [error] of results) {
      if (error) {
        throw error;
      }
    }

    console.log("Seeded 100 posts.");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    redis.disconnect();
  }
}

seed();
