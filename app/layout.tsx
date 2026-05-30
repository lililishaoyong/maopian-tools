import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteUrl } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "猫片 - 像撸猫一样惬意地找片",
    template: "%s | 猫片"
  },
  description: "猫片整理片单灵感、观影工具和公开影视资讯入口，帮你更轻松地发现想看的内容。",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "猫片",
    description: "片单灵感、观影工具和公开影视资讯入口。",
    url: siteUrl,
    siteName: "猫片",
    type: "website"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fff6e9"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
