import type { Category, Resource, SiteContent } from "./types";

export const siteContent: SiteContent = {
  brandName: "猫片",
  brandSlug: "maopian",
  slogan: "像撸猫一样惬意地找片",
  keywords: "惬意、白嫖、影视资源、站内打开、公众号引流",
  bannerTitle: "海量影视资源",
  bannerSubtitle: "免费 · 高清 · 更新快",
  bannerCta: "像撸猫一样惬意地找片",
  followTitle: "关注公众号 获取每日更新",
  followDescription: "每日推送最新影视资源、热门网站更新提醒，不迷路，资源永相伴",
  qrImageUrl: "/brand/qr.png",
  logoImageUrl: "/brand/logo.png",
  heroImageUrl: "/brand/hero-cat.png",
  avatarImageUrl: "/brand/avatar-cat.png"
};

export const categories: Category[] = [
  {
    id: "cat-sites",
    slug: "sites",
    name: "影视网站",
    icon: "Clapperboard",
    description: "聚合电影、剧集、综艺等影视资源站点。",
    sortOrder: 10,
    isVisible: true
  },
  {
    id: "cat-movie",
    slug: "movie",
    name: "电影",
    icon: "Film",
    description: "院线、经典、独立电影和高清片源站。",
    sortOrder: 20,
    isVisible: true
  },
  {
    id: "cat-series",
    slug: "series",
    name: "剧集",
    icon: "Tv",
    description: "国产剧、美剧、日剧、韩剧等剧集入口。",
    sortOrder: 30,
    isVisible: true
  },
  {
    id: "cat-anime",
    slug: "anime",
    name: "动漫",
    icon: "Cat",
    description: "新番、番剧、动画电影和弹幕站推荐。",
    sortOrder: 40,
    isVisible: true
  },
  {
    id: "cat-variety",
    slug: "variety",
    name: "综艺",
    icon: "Sparkles",
    description: "热门综艺、纪录片和娱乐节目资源。",
    sortOrder: 50,
    isVisible: true
  },
  {
    id: "cat-tools",
    slug: "tools",
    name: "工具站",
    icon: "Briefcase",
    description: "字幕、投屏、下载、片单整理等辅助工具。",
    sortOrder: 60,
    isVisible: true
  }
];

export const resources: Resource[] = [
  {
    id: "res-cupfox",
    slug: "cupfox",
    name: "茶杯狐 Cupfox",
    iconUrl: "/brand/avatar-cat.png",
    categorySlug: "sites",
    description: "电影、剧集、动漫一站聚合，适合快速搜索片源。",
    summary: "资源多种类型，更新及时，界面简洁，支持站内 WebView 打开。",
    features: ["资源丰富", "更新及时", "无广告干扰", "支持站内打开"],
    officialUrl: "https://www.cupfox.app",
    status: "published",
    sortOrder: 10,
    isFeatured: true,
    updatedAt: "2026-05-14"
  },
  {
    id: "res-ddys",
    slug: "ddys",
    name: "低端影视",
    iconUrl: "/brand/avatar-cat.png",
    categorySlug: "sites",
    description: "4K 高清资源，播放体验流畅，更新速度稳定。",
    summary: "偏高清观影体验，适合找电影、剧集和高分片源。",
    features: ["4K 高清", "播放稳定", "排版清爽", "站内打开"],
    officialUrl: "https://ddys.pro",
    status: "published",
    sortOrder: 20,
    isFeatured: true,
    updatedAt: "2026-05-14"
  },
  {
    id: "res-age",
    slug: "age",
    name: "AGE 动漫",
    iconUrl: "/brand/avatar-cat.png",
    categorySlug: "anime",
    description: "海量动漫，更新超快，适合追番和补番。",
    summary: "番剧分类清晰，新番更新速度快，动漫党常用入口。",
    features: ["番剧丰富", "分类齐全", "追番友好", "更新及时"],
    officialUrl: "https://www.agedm.org",
    status: "published",
    sortOrder: 30,
    isFeatured: true,
    updatedAt: "2026-05-14"
  },
  {
    id: "res-novideo",
    slug: "novideo",
    name: "No 视频",
    iconUrl: "/brand/avatar-cat.png",
    categorySlug: "movie",
    description: "简洁无广告的观影体验，适合直接搜索电影。",
    summary: "入口轻量，检索直接，适合临时找片。",
    features: ["页面轻量", "检索方便", "体验安静", "适合电影"],
    officialUrl: "https://www.novipnoad.net",
    status: "published",
    sortOrder: 40,
    isFeatured: false,
    updatedAt: "2026-05-14"
  },
  {
    id: "res-bilibili",
    slug: "bilibili-movie",
    name: "哔哩影视",
    iconUrl: "/brand/avatar-cat.png",
    categorySlug: "variety",
    description: "二次元资源聚合站，适合动漫、纪录片和综艺。",
    summary: "内容覆盖动画、纪录片、综艺，正版内容较多。",
    features: ["正版内容", "弹幕氛围", "分类清楚", "移动端友好"],
    officialUrl: "https://www.bilibili.com/movie",
    status: "draft",
    sortOrder: 50,
    isFeatured: false,
    updatedAt: "2026-05-14"
  }
];

export const tools = resources;
