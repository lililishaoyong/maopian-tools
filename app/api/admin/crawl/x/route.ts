import { NextRequest, NextResponse } from "next/server";
import { redirectToAdmin } from "@/lib/admin-redirect";
import { getXCrawlStatus, saveXCrawlStatus } from "@/lib/data";
import type { XCrawlStatus } from "@/lib/types";
import { crawlXCreators, getXCrawlProxyDiagnostic } from "@/lib/x-crawler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

let activeJob: Promise<void> | null = null;

export async function GET() {
  return NextResponse.json(await getXCrawlStatus());
}

export async function POST(request: NextRequest) {
  const form = await request.formData();

  try {
    const creatorId = String(form.get("creatorId") || "") || undefined;
    const full = form.get("full") === "on";
    const current = await getXCrawlStatus();
    const proxyDiagnostic = getXCrawlProxyDiagnostic();

    if (activeJob || isFreshRunningStatus(current)) {
      return redirectToAdmin("/admin/creators?ok=已有采集任务正在运行，请查看进度面板。");
    }

    const initialStatus: XCrawlStatus = {
      running: true,
      phase: "running",
      mode: full ? "full" : "incremental",
      creatorId,
      totalCreators: 0,
      completedCreators: 0,
      scanned: 0,
      added: 0,
      errors: 0,
      proxyConfigured: proxyDiagnostic.configured,
      proxyMessage: proxyDiagnostic.message,
      message: proxyDiagnostic.configured ? "采集任务已启动，正在通过代理准备浏览器。" : "采集任务已启动，正在准备浏览器。当前未配置代理。",
      logs: [`${timeLabel()} 采集任务已启动`, `${timeLabel()} ${proxyDiagnostic.message}`],
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveXCrawlStatus(initialStatus);
    activeJob = runCrawlJob(initialStatus).finally(() => {
      activeJob = null;
    });

    return redirectToAdmin("/admin/creators?ok=采集任务已启动，请查看进度面板。");
  } catch (error) {
    return redirectToAdmin(`/admin/creators?error=${encodeURIComponent(errorMessage(error))}`);
  }
}

async function runCrawlJob(initialStatus: XCrawlStatus) {
  let status = initialStatus;

  try {
    const results = await crawlXCreators({
      creatorId: initialStatus.creatorId,
      full: initialStatus.mode === "full",
      onProgress: async (progress) => {
        status = {
          ...status,
          currentCreator: progress.currentCreator ?? status.currentCreator,
          totalCreators: progress.totalCreators ?? status.totalCreators,
          completedCreators: progress.completedCreators ?? status.completedCreators,
          scanned: progress.scanned ?? status.scanned,
          added: progress.added ?? status.added,
          errors: progress.errors ?? status.errors,
          proxyConfigured: status.proxyConfigured,
          proxyMessage: status.proxyMessage,
          message: progress.message,
          logs: progress.log ? [...status.logs, `${timeLabel()} ${progress.log}`] : status.logs
        };
        await saveXCrawlStatus(status);
      }
    });

    const added = results.reduce((sum, result) => sum + result.added, 0);
    const scanned = results.reduce((sum, result) => sum + result.scanned, 0);
    const errors = results.filter((result) => result.error).length;
    await saveXCrawlStatus({
      ...status,
      running: false,
      phase: errors ? "failed" : "finished",
      completedCreators: results.length,
      totalCreators: status.totalCreators || results.length,
      scanned,
      added,
      errors,
      message: errors ? `采集完成，但有 ${errors} 个账号失败。新增 ${added} 条。` : `采集完成，新增 ${added} 条审核项。`,
      logs: [...status.logs, `${timeLabel()} 采集结束：读取 ${scanned} 条，新增 ${added} 条，错误 ${errors} 个`],
      finishedAt: new Date().toISOString()
    });
  } catch (error) {
    await saveXCrawlStatus({
      ...status,
      running: false,
      phase: "failed",
      errors: status.errors + 1,
      message: errorMessage(error),
      logs: [...status.logs, `${timeLabel()} 采集失败：${errorMessage(error)}`],
      finishedAt: new Date().toISOString()
    });
  }
}

function isFreshRunningStatus(status: XCrawlStatus) {
  if (!status.running) return false;
  const updatedAt = status.updatedAt ? new Date(status.updatedAt).getTime() : 0;
  return Date.now() - updatedAt < 30 * 60 * 1000;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "X 采集失败。";
}

function timeLabel() {
  return new Date().toLocaleTimeString("zh-CN", { hour12: false });
}
