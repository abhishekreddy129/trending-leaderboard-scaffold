// test.js — proves the leaderboard works.
// Run with:  npm test   (run `npm run seed` first)
//
// The test: take a LOW-scored post, upvote it 50 times, then assert it now
// appears in the top 10 of getTop(10). If it doesn't, your upvote/getTop is wrong.

import { upvote, getTop, redis } from "./leaderboard.js";
import assert from "node:assert/strict";

async function run() {
  const target = "post:50"; // any seeded post id

  try {
    const initialScore = await redis.zscore("trending:posts", target);
    const metadata = await redis.hgetall(`${target}:meta`);

    assert.notEqual(initialScore, null, `${target} must be seeded`);
    assert.equal(metadata.title, "Post number 50");
    assert.equal(metadata.author, "@user50");

    for (let i = 0; i < 50; i++) {
      await upvote(target);
    }

    const top = await getTop(10);
    console.log("Top 10:");
    top.forEach((p, i) => console.log(`  #${i + 1}  ${p.id}  score=${p.score}  ${p.title} (${p.author})`));

    const targetPost = top.find((post) => post.id === target);

    assert.ok(targetPost, `${target} should reach the top 10`);
    assert.equal(targetPost.score, Number(initialScore) + 50);
    assert.equal(targetPost.title, "Post number 50");
    assert.equal(targetPost.author, "@user50");

    console.log(`\nPASS ✅  ${target} reached the top 10`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    redis.disconnect();
  }
}

run();
