import { storage } from "@vendetta/plugin";

export type CustomItem = {
  userId: string;
  type: string;
  label: string;
  uri: string;
};

type EnhancedStorage = {
  badges?: CustomItem[];
  clanTags?: CustomItem[];
};

const data = storage as EnhancedStorage;

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

export function getClanTags() {
  data.clanTags ??= [];
  return data.clanTags;
}

export function getClanTagForUser(userId: string) {
  return getClanTags().find((clan) => clan.userId === userId);
}

export function addClanTag(userId: string, label: string, uri: string) {
  const clans = getClanTags();
  const existing = clans.find((clan) => clan.userId === userId);

  if (existing) {
    existing.label = label;
    existing.uri = uri;
  } else {
    clans.push({
      userId,
      type: `clan-${userId}`,
      label,
      uri
    });
  }
}

export function removeClanTag(userId: string) {
  data.clanTags = getClanTags().filter((clan) => clan.userId !== userId);
}