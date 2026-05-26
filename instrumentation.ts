export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { cleanupLegacyCrawlData } = await import("./lib/legacy-cleanup");
    await cleanupLegacyCrawlData();
  }
}
