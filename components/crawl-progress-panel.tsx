"use client";

import { useEffect, useMemo, useState } from "react";
import type { XCrawlStatus } from "@/lib/types";

const emptyStatus: XCrawlStatus = {
  running: false,
  phase: "idle",
  mode: "incremental",
  totalCreators: 0,
  completedCreators: 0,
  scanned: 0,
  added: 0,
  errors: 0,
  proxyConfigured: false,
  proxyMessage: "未配置代理。",
  message: "尚未开始采集。",
  logs: [],
  startedAt: "",
  updatedAt: "",
  finishedAt: ""
};

export function CrawlProgressPanel({ initialStatus }: { initialStatus: XCrawlStatus }) {
  const [status, setStatus] = useState(initialStatus || emptyStatus);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      try {
        const response = await fetch("/api/admin/crawl/x", { cache: "no-store" });
        if (!response.ok) return;
        const nextStatus = (await response.json()) as XCrawlStatus;
        if (!cancelled) setStatus(nextStatus);
      } catch {
        // Keep the last visible status; the next poll may recover.
      }
    }

    void loadStatus();
    const timer = window.setInterval(loadStatus, status.running ? 2000 : 5000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [status.running]);

  const percent = useMemo(() => {
    if (!status.totalCreators) return status.running ? 12 : 100;
    return Math.min(100, Math.round((status.completedCreators / status.totalCreators) * 100));
  }, [status.completedCreators, status.running, status.totalCreators]);

  return (
    <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-950">采集进度</h2>
          <p className="mt-1 text-sm text-stone-500">{status.message}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.running ? "bg-amber-50 text-amber-700" : status.phase === "failed" ? "bg-rose-50 text-rose-700" : "bg-brand-50 text-brand-700"}`}>
          {status.running ? "运行中" : status.phase === "failed" ? "有错误" : status.phase === "finished" ? "已完成" : "空闲"}
        </span>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-stone-100">
        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${percent}%` }} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Metric label="模式" value={status.mode === "full" ? "全量" : "增量"} />
        <Metric label="当前账号" value={status.currentCreator ? `@${status.currentCreator}` : "-"} />
        <Metric label="账号进度" value={`${status.completedCreators}/${status.totalCreators || 0}`} />
        <Metric label="已读帖子" value={String(status.scanned)} />
        <Metric label="新增审核项" value={String(status.added)} />
        <Metric label="代理状态" value={status.proxyMessage || (status.proxyConfigured ? "代理已配置" : "未配置代理")} />
      </div>

      <div className="mt-4 rounded-xl bg-stone-950 p-3 text-xs leading-6 text-stone-100">
        {status.logs.length ? (
          status.logs.slice(-8).map((log) => <div key={log}>{log}</div>)
        ) : (
          <div>等待采集任务启动。</div>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-stone-50 p-3">
      <p className="text-xs text-stone-500">{label}</p>
      <strong className="mt-1 block truncate text-sm text-stone-950">{value}</strong>
    </div>
  );
}
