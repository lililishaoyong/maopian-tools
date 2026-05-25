import { chromium, type BrowserContext, type Page } from "playwright";
import {
  getReviewItems,
  getXCreators,
  getXSeenTweets,
  getXSession,
  saveReviewItems,
  saveXCreators,
  saveXSeenTweets
} from "./data";
import { xCrawlProxyUrl } from "./env";
import type { ReviewItem, XCreatorSource } from "./types";

type ExtractedTweet = {
  content: string;
  tweetUrl: string;
  links: string[];
};

type CrawlResult = {
  creatorId: string;
  handle: string;
  added: number;
  scanned: number;
  error?: string;
};

type CrawlProgress = {
  message: string;
  currentCreator?: string;
  totalCreators?: number;
  completedCreators?: number;
  scanned?: number;
  added?: number;
  errors?: number;
  log?: string;
};

type CrawlProxyConfig = {
  server: string;
  username?: string;
  password?: string;
};

const ignoredHosts = new Set(["x.com", "www.x.com", "twitter.com", "www.twitter.com", "t.co", "pbs.twimg.com", "video.twimg.com"]);
const ignoredExtensions = /\.(jpg|jpeg|png|gif|webp|svg|mp4|mov|m3u8)(\?.*)?$/i;

export function getXCrawlProxyDiagnostic() {
  const configured = Boolean(xCrawlProxyUrl.trim());
  return {
    configured,
    message: configured ? "代理已配置，正在通过代理访问 X。" : "未配置代理，采集会直连 X。"
  };
}

export async function crawlXCreators(options: { creatorId?: string; full?: boolean; onProgress?: (progress: CrawlProgress) => Promise<void> | void } = {}) {
  const [session, creators, reviewItems, seenTweets] = await Promise.all([
    getXSession(),
    getXCreators(),
    getReviewItems(),
    getXSeenTweets()
  ]);

  if (!session.isConfigured || !session.cookieText.trim()) {
    throw new Error("尚未配置 X Cookie，无法采集。");
  }

  const targetCreators = creators.filter((creator) => creator.enabled && (!options.creatorId || creator.id === options.creatorId));
  if (!targetCreators.length) {
    return [] satisfies CrawlResult[];
  }
  const proxyDiagnostic = getXCrawlProxyDiagnostic();
  await options.onProgress?.({
    message: `准备采集 ${targetCreators.length} 个创作者。${proxyDiagnostic.configured ? "将通过代理访问 X。" : "当前未配置代理。"}`,
    totalCreators: targetCreators.length,
    completedCreators: 0,
    scanned: 0,
    added: 0,
    errors: 0,
    log: `准备采集 ${targetCreators.length} 个创作者；${proxyDiagnostic.message}`
  });

  const browser = await chromium.launch(createLaunchOptions());
  const context = await browser.newContext(createBrowserContextOptions());

  try {
    await addCookieHeader(context, session.cookieText);
    const results: CrawlResult[] = [];
    let nextReviewItems = [...reviewItems];
    let nextSeenTweets = [...seenTweets];
    let nextCreators = [...creators];

    for (const creator of targetCreators) {
      const page = await context.newPage();
      try {
        await options.onProgress?.({
          message: `正在打开 @${creator.handle}。`,
          currentCreator: creator.handle,
          log: `开始采集 @${creator.handle}`
        });
        const extracted = await crawlCreatorPage(page, creator, {
          full: Boolean(options.full),
          seenTweets: new Set(nextSeenTweets),
          onProgress: async (progress) => {
            await options.onProgress?.({
              message: `@${creator.handle} 已读取 ${progress.scanned} 条帖子。`,
              currentCreator: creator.handle,
              scanned: results.reduce((sum, result) => sum + result.scanned, 0) + progress.scanned,
              log: progress.log
            });
          }
        });
        const pending = await buildReviewItems(creator, extracted, nextReviewItems);
        nextReviewItems = [...pending.items, ...nextReviewItems];
        nextSeenTweets = [...nextSeenTweets, ...pending.seenTweets];
        nextCreators = nextCreators.map((item) =>
          item.id === creator.id
            ? {
                ...item,
                lastCrawledAt: new Date().toISOString(),
                lastTweetUrl: extracted[0]?.tweetUrl || item.lastTweetUrl,
                lastError: ""
              }
            : item
        );
        results.push({ creatorId: creator.id, handle: creator.handle, added: pending.items.length, scanned: extracted.length });
        await options.onProgress?.({
          message: `@${creator.handle} 完成，新增 ${pending.items.length} 条审核项。`,
          currentCreator: creator.handle,
          completedCreators: results.length,
          scanned: results.reduce((sum, result) => sum + result.scanned, 0),
          added: results.reduce((sum, result) => sum + result.added, 0),
          errors: results.filter((result) => result.error).length,
          log: `@${creator.handle} 完成：读取 ${extracted.length} 条，新增 ${pending.items.length} 条`
        });
      } catch (error) {
        nextCreators = nextCreators.map((item) =>
          item.id === creator.id ? { ...item, lastCrawledAt: new Date().toISOString(), lastError: errorMessage(error) } : item
        );
        results.push({ creatorId: creator.id, handle: creator.handle, added: 0, scanned: 0, error: errorMessage(error) });
        await options.onProgress?.({
          message: `@${creator.handle} 采集失败。`,
          currentCreator: creator.handle,
          completedCreators: results.length,
          errors: results.filter((result) => result.error).length,
          log: `@${creator.handle} 失败：${errorMessage(error)}`
        });
      } finally {
        await page.close();
      }
    }

    await Promise.all([saveReviewItems(nextReviewItems), saveXSeenTweets(nextSeenTweets), saveXCreators(nextCreators)]);
    return results;
  } finally {
    await context.close();
    await browser.close();
  }
}

export async function testXCrawlAccess() {
  const proxyDiagnostic = getXCrawlProxyDiagnostic();
  const browser = await chromium.launch(createLaunchOptions());
  const context = await browser.newContext(createBrowserContextOptions());
  const page = await context.newPage();

  try {
    const session = await getXSession();
    if (session.isConfigured && session.cookieText.trim()) {
      await addCookieHeader(context, session.cookieText);
    }

    await page.goto("https://x.com", { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(2000);

    const title = await page.title();
    const loginSignals = await page.locator('input[name="text"], input[name="password"], a[href="/login"], a[href="/i/flow/login"]').count();
    const tweetSignals = await page.locator('article[data-testid="tweet"], [data-testid="primaryColumn"]').count();
    const loggedInLikely = Boolean(session.isConfigured && tweetSignals);

    return {
      ok: true,
      proxyConfigured: proxyDiagnostic.configured,
      title,
      loggedInLikely,
      message: loggedInLikely
        ? `${proxyDiagnostic.message} X 可访问，Cookie 看起来可用。`
        : loginSignals
          ? `${proxyDiagnostic.message} X 可访问，但当前会话可能未登录或 Cookie 已失效。`
          : `${proxyDiagnostic.message} X 可访问，已读取页面标题：${title || "无标题"}。`
    };
  } catch (error) {
    return {
      ok: false,
      proxyConfigured: proxyDiagnostic.configured,
      title: "",
      loggedInLikely: false,
      message: errorMessage(error)
    };
  } finally {
    await page.close().catch(() => undefined);
    await context.close().catch(() => undefined);
    await browser.close().catch(() => undefined);
  }
}

export async function extractExternalResourceLinks(rawLinks: string[]) {
  const expanded = await Promise.all(rawLinks.map(resolveRedirectUrl));
  return Array.from(new Set(expanded.map(normalizeUrl).filter((url): url is string => Boolean(url)).filter(isExternalResourceUrl)));
}

export function titleFromContent(content: string, resourceUrl: string) {
  const firstLine = content
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);
  if (firstLine) return firstLine.slice(0, 48);
  return hostFromUrl(resourceUrl);
}

async function crawlCreatorPage(
  page: Page,
  creator: XCreatorSource,
  options: { full: boolean; seenTweets: Set<string>; onProgress?: (progress: { scanned: number; log?: string }) => Promise<void> | void }
): Promise<ExtractedTweet[]> {
  await page.goto(creator.profileUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);

  const extracted = new Map<string, ExtractedTweet>();
  let staleScrolls = 0;
  let previousCount = 0;
  const maxScrolls = options.full ? 120 : 20;

  for (let index = 0; index < maxScrolls; index += 1) {
    const tweets = await readVisibleTweets(page);
    for (const tweet of tweets) {
      if (options.full || !options.seenTweets.has(tweet.tweetUrl)) {
        extracted.set(tweet.tweetUrl, tweet);
      }
    }

    if (!options.full && tweets.some((tweet) => options.seenTweets.has(tweet.tweetUrl))) {
      break;
    }

    if (extracted.size === previousCount) {
      staleScrolls += 1;
    } else {
      staleScrolls = 0;
      previousCount = extracted.size;
    }
    if (staleScrolls >= 5) break;

    await options.onProgress?.({
      scanned: extracted.size,
      log: `@${creator.handle} 滚动第 ${index + 1} 次，累计读取 ${extracted.size} 条`
    });
    await page.mouse.wheel(0, 1400);
    await page.waitForTimeout(1200);
  }

  return Array.from(extracted.values());
}

async function readVisibleTweets(page: Page): Promise<ExtractedTweet[]> {
  return page.locator('article[data-testid="tweet"]').evaluateAll((articles) =>
    articles
      .map((article) => {
        const content = (article as HTMLElement).innerText
          .split("\n")
          .filter((line) => !/^(@|·|Reply|Repost|Like|View|Show more|Translate post)/i.test(line.trim()))
          .join("\n")
          .trim();
        const links = Array.from(article.querySelectorAll<HTMLAnchorElement>("a[href]")).flatMap((anchor) => [
          anchor.href,
          anchor.innerText.trim()
        ]);
        const tweetUrl = links.find((href) => /\/status\/\d+/.test(href)) || "";
        return { content, tweetUrl, links };
      })
      .filter((tweet) => tweet.tweetUrl && tweet.content)
  );
}

async function buildReviewItems(creator: XCreatorSource, tweets: ExtractedTweet[], currentItems: ReviewItem[]) {
  const currentKeys = new Set(
    currentItems.map((item) => `${item.tweetUrl || ""}|${item.resourceUrl || item.url || ""}`)
  );
  const items: ReviewItem[] = [];
  const seenTweets: string[] = [];

  for (const tweet of tweets) {
    seenTweets.push(tweet.tweetUrl);
    const links = await extractExternalResourceLinks(tweet.links);
    for (const resourceUrl of links) {
      const key = `${tweet.tweetUrl}|${resourceUrl}`;
      if (currentKeys.has(key)) continue;
      currentKeys.add(key);
      items.push({
        id: `review-x-${hashKey(key)}`,
        source: creator.name || creator.handle,
        title: titleFromContent(tweet.content, resourceUrl),
        url: resourceUrl,
        content: tweet.content,
        resourceUrl,
        tweetUrl: tweet.tweetUrl,
        sourceProfile: creator.profileUrl,
        sourceType: "x",
        suggestedCategorySlug: "sites",
        resourceName: hostFromUrl(resourceUrl),
        description: tweet.content.split("\n").find(Boolean)?.slice(0, 80) || `${hostFromUrl(resourceUrl)} 影视资源入口`,
        summary: tweet.content,
        features: ["影视资源", "来自 X 创作者", "待人工确认"],
        risk: "low",
        status: "pending",
        collectedAt: new Date().toISOString()
      });
    }
  }

  return { items, seenTweets };
}

async function resolveRedirectUrl(value: string) {
  const normalized = normalizeUrl(value);
  if (!normalized) return "";
  try {
    const url = new URL(normalized);
    if (url.hostname.toLowerCase() !== "t.co") return normalized;
    const response = await fetch(normalized, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(8000) });
    return response.url || normalized;
  } catch {
    return normalized;
  }
}

async function addCookieHeader(context: BrowserContext, cookieText: string) {
  const parsedCookies = cookieText
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .flatMap((part) => {
      const [name, ...rest] = part.split("=");
      const value = rest.join("=");
      return [".x.com", ".twitter.com"].map((domain) => ({
        name,
        value,
        domain,
        path: "/",
        secure: true,
        httpOnly: false,
        sameSite: "Lax" as const
      }));
    })
    .filter((cookie) => cookie.name && cookie.value);
  await context.addCookies(parsedCookies);
}

function isExternalResourceUrl(value: string) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    if (ignoredHosts.has(url.hostname.toLowerCase())) return false;
    if (ignoredExtensions.test(url.pathname)) return false;
    return true;
  } catch {
    return false;
  }
}

function normalizeUrl(value: string) {
  try {
    const candidate = value.trim();
    const url = new URL(/^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`);
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

function hostFromUrl(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

function hashKey(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message.includes("Executable doesn't exist")) {
    return "浏览器内核未安装。请运行 npx playwright install chromium，或配置 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH 指向本机 Chrome。";
  }
  if (error instanceof Error && /ERR_PROXY|proxy|ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENOTFOUND/i.test(error.message)) {
    return `代理连接失败或 X 访问超时：${error.message}`;
  }
  if (error instanceof Error && /Timeout/i.test(error.message)) {
    return `页面加载超时，请检查代理或 X Cookie：${error.message}`;
  }
  return error instanceof Error ? error.message : "X 采集失败。";
}

function createLaunchOptions() {
  const executablePath = resolveChromiumExecutablePath();
  const proxy = resolveCrawlProxyConfig();
  return {
    headless: true,
    ...(executablePath ? { executablePath } : {}),
    ...(proxy ? { proxy } : {})
  };
}

function createBrowserContextOptions() {
  return {
    viewport: { width: 1280, height: 900 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  };
}

function resolveCrawlProxyConfig(): CrawlProxyConfig | undefined {
  const value = xCrawlProxyUrl.trim();
  if (!value) return undefined;

  try {
    const url = new URL(value);
    if (!["http:", "socks5:"].includes(url.protocol)) {
      throw new Error("unsupported protocol");
    }
    const server = `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ""}`;
    return {
      server,
      username: url.username ? decodeURIComponent(url.username) : undefined,
      password: url.password ? decodeURIComponent(url.password) : undefined
    };
  } catch {
    throw new Error("X_CRAWL_PROXY_URL 格式不正确，请使用 socks5://host:port、http://host:port 或 http://user:pass@host:port。");
  }
}

function resolveChromiumExecutablePath() {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
    return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  }

  const platform = process.platform;
  if (platform === "darwin") {
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  }
  if (platform === "linux") {
    return "/usr/bin/chromium-browser";
  }

  return undefined;
}
