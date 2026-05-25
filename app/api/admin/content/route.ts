import { NextRequest, NextResponse } from "next/server";
import { getSiteContent, saveSiteContent } from "@/lib/data";
import type { SiteContent } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const form = await request.formData();

  try {
    const current = await getSiteContent();
    const nextContent: SiteContent = {
      brandName: text(form, "brandName", current.brandName),
      brandSlug: text(form, "brandSlug", current.brandSlug),
      slogan: text(form, "slogan", current.slogan),
      keywords: text(form, "keywords", current.keywords),
      bannerTitle: text(form, "bannerTitle", current.bannerTitle),
      bannerSubtitle: text(form, "bannerSubtitle", current.bannerSubtitle),
      bannerCta: text(form, "bannerCta", current.bannerCta),
      followTitle: text(form, "followTitle", current.followTitle),
      followDescription: text(form, "followDescription", current.followDescription),
      qrImageUrl: text(form, "qrImageUrl", current.qrImageUrl),
      logoImageUrl: text(form, "logoImageUrl", current.logoImageUrl),
      heroImageUrl: text(form, "heroImageUrl", current.heroImageUrl),
      avatarImageUrl: text(form, "avatarImageUrl", current.avatarImageUrl)
    };

    if (!nextContent.brandName || !nextContent.bannerTitle) {
      throw new Error("品牌名和首页标题必填。");
    }

    await saveSiteContent(nextContent);
    return redirectTo(request, "/admin/content?ok=saved");
  } catch (error) {
    return redirectTo(request, `/admin/content?error=${encodeURIComponent(errorMessage(error))}`);
  }
}

function text(form: FormData, key: keyof SiteContent, fallback: string) {
  return String(form.get(key) || fallback).trim();
}

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "保存失败，请检查 Redis 连接。";
}
