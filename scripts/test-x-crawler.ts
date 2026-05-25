import assert from "node:assert/strict";
import { extractExternalResourceLinks, titleFromContent } from "../lib/x-crawler";

async function main() {
  const links = await extractExternalResourceLinks([
    "https://x.com/grgerwcwetwet/status/123",
    "https://twitter.com/grgerwcwetwet",
    "https://mtyy4.com",
    "https://mtyy4.com/",
    "https://flixflop.com/path?utm=1",
    "https://pbs.twimg.com/media/example.jpg"
  ]);

  assert.deepEqual(links, ["https://mtyy4.com/", "https://flixflop.com/path?utm=1"]);
  assert.equal(
    titleFromContent("整理了两个还不错的影视站，\n片源更新快，查找也比较方便。", "https://mtyy4.com"),
    "整理了两个还不错的影视站，"
  );
  assert.equal(titleFromContent("", "https://flixflop.com"), "flixflop.com");
  console.log("x-crawler tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
