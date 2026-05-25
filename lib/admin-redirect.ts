import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/env";

export function redirectToAdmin(path: string) {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return NextResponse.redirect(new URL(safePath, `${siteUrl}/`), { status: 303 });
}
