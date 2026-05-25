import { NextRequest, NextResponse } from "next/server";
import { assertUrl, creatorHandleFromUrl, getXCreators, newId, saveXCreators } from "@/lib/data";
import type { XCreatorSource } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const action = String(form.get("action") || "save");

  try {
    const creators = await getXCreators();
    const id = String(form.get("id") || "");

    if (action === "delete") {
      await saveXCreators(creators.filter((creator) => creator.id !== id));
      return redirectTo(request, "/admin/creators?ok=deleted");
    }

    const nextCreator = creatorFromForm(form);
    const duplicate = creators.find(
      (creator) => creator.profileUrl === nextCreator.profileUrl && creator.id !== nextCreator.id
    );
    if (duplicate) throw new Error("该创作者主页已存在。");

    const exists = creators.some((creator) => creator.id === nextCreator.id);
    const nextCreators = exists
      ? creators.map((creator) => (creator.id === nextCreator.id ? { ...creator, ...nextCreator, createdAt: creator.createdAt } : creator))
      : [...creators, nextCreator];

    await saveXCreators(nextCreators);
    return redirectTo(request, "/admin/creators?ok=saved");
  } catch (error) {
    return redirectTo(request, `/admin/creators?error=${encodeURIComponent(errorMessage(error))}`);
  }
}

function creatorFromForm(form: FormData): XCreatorSource {
  const profileUrl = String(form.get("profileUrl") || "").trim();
  assertUrl(profileUrl);
  const handle = creatorHandleFromUrl(profileUrl);
  if (!handle) throw new Error("无法识别 X 创作者 handle。");
  const now = new Date().toISOString();

  return {
    id: String(form.get("id") || "") || newId("creator"),
    name: String(form.get("name") || handle).trim() || handle,
    profileUrl,
    handle,
    enabled: form.get("enabled") === "on",
    lastCrawledAt: String(form.get("lastCrawledAt") || ""),
    lastTweetUrl: String(form.get("lastTweetUrl") || ""),
    lastError: String(form.get("lastError") || ""),
    createdAt: now
  };
}

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "保存失败。";
}
