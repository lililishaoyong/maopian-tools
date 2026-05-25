export type Category = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
  sortOrder: number;
  isVisible: boolean;
};

export type ResourceStatus = "draft" | "published" | "archived";

export type Resource = {
  id: string;
  slug: string;
  name: string;
  iconUrl: string;
  categorySlug: string;
  description: string;
  summary: string;
  features: string[];
  officialUrl: string;
  status: ResourceStatus;
  sortOrder: number;
  isFeatured: boolean;
  updatedAt: string;
};

export type Tool = Resource;

export type SiteContent = {
  brandName: string;
  brandSlug: string;
  slogan: string;
  keywords: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerCta: string;
  followTitle: string;
  followDescription: string;
  qrImageUrl: string;
  logoImageUrl: string;
  heroImageUrl: string;
  avatarImageUrl: string;
};

export type XCreatorSource = {
  id: string;
  name: string;
  profileUrl: string;
  handle: string;
  enabled: boolean;
  lastCrawledAt: string;
  lastTweetUrl: string;
  lastError?: string;
  createdAt: string;
};

export type XSessionConfig = {
  cookieText: string;
  updatedAt: string;
  isConfigured: boolean;
};

export type XCrawlStatus = {
  running: boolean;
  phase: "idle" | "running" | "finished" | "failed";
  mode: "full" | "incremental";
  creatorId?: string;
  currentCreator?: string;
  totalCreators: number;
  completedCreators: number;
  scanned: number;
  added: number;
  errors: number;
  proxyConfigured?: boolean;
  proxyMessage?: string;
  message: string;
  logs: string[];
  startedAt: string;
  updatedAt: string;
  finishedAt?: string;
};

export type ReviewItem = {
  id: string;
  source: string;
  title: string;
  url: string;
  content?: string;
  resourceUrl?: string;
  tweetUrl?: string;
  sourceProfile?: string;
  sourceType?: "seed" | "x";
  suggestedCategorySlug?: string;
  resourceName?: string;
  description?: string;
  summary?: string;
  features?: string[];
  editedAt?: string;
  risk: "low" | "medium" | "high";
  status: "pending" | "approved" | "rejected" | "ignored";
  collectedAt: string;
};
