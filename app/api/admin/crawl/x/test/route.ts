import { NextRequest, NextResponse } from "next/server";
import { testXCrawlAccess } from "@/lib/x-crawler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(await testXCrawlAccess());
}

export async function POST(request: NextRequest) {
  const result = await testXCrawlAccess();
  const param = result.ok ? "ok" : "error";
  return NextResponse.redirect(new URL(`/admin/creators?${param}=${encodeURIComponent(result.message)}`, request.url));
}
