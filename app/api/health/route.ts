import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  let redis = "down";

  try {
    const client = await getRedis();
    await client.ping();
    redis = "ok";
  } catch {
    redis = "down";
  }

  return NextResponse.json({
    ok: redis === "ok",
    redis,
    time: new Date().toISOString()
  });
}
