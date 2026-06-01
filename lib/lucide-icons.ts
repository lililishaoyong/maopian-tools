import { Clapperboard, icons } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const DEFAULT_CATEGORY_ICON = "Clapperboard";

const iconRegistry = icons as Partial<Record<string, LucideIcon>>;

export const lucideIconNames = Object.keys(iconRegistry).sort((a, b) => a.localeCompare(b));

export const suggestedCategoryIcons = [
  "Clapperboard",
  "Film",
  "Tv",
  "Video",
  "Play",
  "Theater",
  "Cat",
  "Sparkles",
  "Star",
  "Heart",
  "Globe",
  "Briefcase"
].filter((name) => name in iconRegistry);

export function resolveLucideIcon(name?: string): {
  Icon: LucideIcon;
  isValid: boolean;
  name: string;
} {
  const resolvedName = normalizeIconName(name || DEFAULT_CATEGORY_ICON);
  const Icon = iconRegistry[resolvedName];

  if (Icon) {
    return { Icon, isValid: true, name: resolvedName };
  }

  return { Icon: Clapperboard, isValid: false, name: resolvedName };
}

function normalizeIconName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return DEFAULT_CATEGORY_ICON;
  if (trimmed in iconRegistry) return trimmed;

  const caseInsensitiveMatch = lucideIconNames.find((iconName) => iconName.toLowerCase() === trimmed.toLowerCase());
  if (caseInsensitiveMatch) return caseInsensitiveMatch;

  const pascalName = trimmed
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("");

  return pascalName in iconRegistry ? pascalName : trimmed;
}
