import { chromium } from "playwright";

const siteUrl = process.env.PROD_URL || process.env.SITE_URL || "https://miaopian.top";
const adminUser = process.env.PROD_ADMIN_USER || "admin";
const adminPassword = process.env.PROD_ADMIN_PASSWORD;

if (!adminPassword) {
  console.error("PROD_ADMIN_PASSWORD is required.");
  process.exit(1);
}

const site = new URL(siteUrl);
const browser = await chromium.launch();
const page = await browser.newPage({
  httpCredentials: {
    username: adminUser,
    password: adminPassword
  }
});

try {
  await page.goto(new URL("/admin/creators", site).toString(), { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "X 创作者采集" }).waitFor({ timeout: 15000 });
  if (new URL(page.url()).hostname !== site.hostname) {
    throw new Error(`Admin page opened on unexpected host: ${page.url()}`);
  }

  await page.getByPlaceholder("粘贴 X 请求 Cookie，例如 auth_token=...; ct0=...").fill("bad");
  await page.getByRole("button", { name: "保存 Cookie" }).click();
  await page.waitForURL((url) => url.hostname === site.hostname && url.pathname === "/admin/creators", {
    timeout: 15000
  });
  await page.getByText("请粘贴有效的 Cookie 文本。").waitFor({ timeout: 15000 });

  console.log(`Browser verification passed on ${page.url()}`);
} finally {
  await browser.close();
}
