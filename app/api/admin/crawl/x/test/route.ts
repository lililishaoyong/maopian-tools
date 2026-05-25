import { NextResponse } from "next/server";
import { redirectToAdmin } from "@/lib/admin-redirect";
import { testXCrawlAccess } from "@/lib/x-crawler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(await testXCrawlAccess());
}

export async function POST() {
  const result = await testXCrawlAccess();
  const param = result.ok ? "ok" : "error";
  return redirectToAdmin(`/admin/creators?${param}=${encodeURIComponent(result.message)}`);
}
