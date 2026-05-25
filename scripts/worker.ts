import cron from "node-cron";
import { getRedis } from "../lib/redis";
import { cronDailyCollect } from "../lib/env";
import { reviewItems } from "../lib/seed";
import { crawlXCreators } from "../lib/x-crawler";

async function runDailyCollect() {
  const redis = await getRedis();
  const existing = await redis.get("review:items");
  const current = existing ? JSON.parse(existing) : [];
  const ids = new Set(current.map((item: { id: string }) => item.id));
  const nextItems = [...current];

  for (const item of reviewItems) {
    if (!ids.has(item.id)) {
      nextItems.push(item);
    }
  }

  await redis.set("review:items", JSON.stringify(nextItems));
  await redis.set("worker:lastCollectAt", new Date().toISOString());
  console.log(`[worker] collected ${nextItems.length} review items`);

  try {
    const results = await crawlXCreators({ full: false });
    const added = results.reduce((sum, result) => sum + result.added, 0);
    console.log(`[worker] x crawl added ${added} review items`);
  } catch (error) {
    console.error("[worker] x crawl skipped", error);
  }
}

async function main() {
  if (!cron.validate(cronDailyCollect)) {
    throw new Error(`Invalid CRON_DAILY_COLLECT: ${cronDailyCollect}`);
  }

  await runDailyCollect();

  cron.schedule(cronDailyCollect, () => {
    runDailyCollect().catch((error) => {
      console.error("[worker] collect failed", error);
    });
  });

  console.log(`[worker] scheduled daily collect: ${cronDailyCollect}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
