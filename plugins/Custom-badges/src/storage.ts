import { storage } from "@vendetta/plugin";

export type CustomBadge = {
  userId: string;
  label: string;
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
  return getBadges().find((badge) => badge.userId === userId);
}

export function addBadge(userId: string, label: string) {
  const badges = getBadges();
  const existing = badges.find((badge) => badge.userId === userId);

  if (existing) {
    existing.label = label;
    return;
  }

  badges.push({ userId, label });
}

export function removeBadge(userId: string) {
  data.badges = getBadges().filter((badge) => badge.userId !== userId);
}
