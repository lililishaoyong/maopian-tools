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
