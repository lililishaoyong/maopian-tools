import type { Category, Resource, SiteContent } from "./types";

export const siteContent: SiteContent = {
  brandName: "猫片",
  brandSlug: "maopian",
  slogan: "像撸猫一样惬意地找片",
  keywords: "片单灵感、观影工具、公开影视资讯入口、公众号互导",
  bannerTitle: "轻松找到观影灵感",
  bannerSubtitle: "片单 · 工具 · 公开资讯入口",
  bannerCta: "像撸猫一样惬意地找片",
  followTitle: "关注猫片观影指南",
  followDescription: "获取片单灵感、观影工具和公开影视资讯入口更新。",
  qrImageUrl: "/brand/qr.png",
  logoImageUrl: "/brand/logo.png",
  heroImageUrl: "/brand/hero-cat.png",
  avatarImageUrl: "/brand/avatar-cat.png"
};

export const categories: Category[] = [
  {
    id: "cat-sites",
    slug: "sites",
    name: "影视入口",
    icon: "Clapperboard",
    description: "整理电影、剧集、综艺等公开影视资讯入口。",
    sortOrder: 10,
    isVisible: true
  },
  {
    id: "cat-movie",
    slug: "movie",
    name: "电影",
    icon: "Film",
    description: "院线、经典、独立电影的片单与资讯入口。",
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
    description: "字幕、投屏、片单整理、观影记录等辅助工具。",
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
    description: "电影、剧集、动漫信息检索入口，适合观影前快速查找。",
    summary: "分类覆盖多种类型，界面简洁，适合做观影前检索。",
    features: ["信息检索", "分类清楚", "界面简洁", "站内打开"],
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
    description: "影视条目信息入口，排版清爽，适合查找电影和剧集。",
    summary: "偏安静的观影信息检索体验，适合查找电影、剧集和热门条目。",
    features: ["条目清楚", "体验稳定", "排版清爽", "站内打开"],
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
    description: "动漫信息与番剧更新入口，适合追番和补番前查看。",
    summary: "番剧分类清晰，适合动漫爱好者做片单检索。",
    features: ["番剧信息", "分类齐全", "追番友好", "更新参考"],
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
    description: "简洁的观影信息检索体验，适合查找电影条目。",
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
    description: "二次元内容与影视专区入口，适合动漫、纪录片和综艺。",
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
