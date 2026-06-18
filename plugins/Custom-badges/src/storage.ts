import { storage } from "@vendetta/plugin";

export type CustomBadge = {
  userId: string;
  type: string;
  label: string;
  uri: string;
};

type BadgeStorage = {
  badges?: CustomBadge[];
};

const data = storage as BadgeStorage;

export function getBadges() {
  data.badges ??= [];
  return data.badges;
}

export function getBadgeForUser(userId: string) {
  return getBadges().filter((badge) => badge.userId === userId);
}

export function addBadge(userId: string, label: string, uri: string) {
  const badges = getBadges();
  const type = `${userId}-${label}`.replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
  const existing = badges.find((badge) => badge.userId === userId && badge.type === type);

  if (existing) {
    existing.label = label;
    existing.uri = uri;
    return;
  }

  badges.push({ userId, type, label, uri });
}

export function removeBadge(type: string) {
  data.badges = getBadges().filter((badge) => badge.type !== type);
}
