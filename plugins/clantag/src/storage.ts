import { storage } from "@vendetta/plugin";

export type CustomItem = {
  userId: string;
  type: string;
  label: string;
  uri: string;
};

type EnhancedStorage = {
  badges?: CustomItem[];
  clanTags?: CustomItem[]; // Neu: Speicherplatz für Clan-Tags
};

const data = storage as EnhancedStorage;

// --- BADGE STORAGE (Bleibt gleich) ---
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
  if (badges.find((b) => b.userId === userId && b.type === type)) return;
  badges.push({ userId, type, label, uri });
}
export function removeBadge(type: string) {
  data.badges = getBadges().filter((badge) => badge.type !== type);
}

// --- NEU: CLAN TAG STORAGE ---
export function getClanTags() {
  data.clanTags ??= [];
  return data.clanTags;
}

export function getClanTagForUser(userId: string) {
  // Da ein User nur ein Clan-Tag haben kann, nehmen wir das erste Match
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
      label, // Das wird der Text neben dem Namen (z.B. Qrew)
      uri    // Das wird die custom Icon-URL
    });
  }
}

export function removeClanTag(userId: string) {
  data.clanTags = getClanTags().filter((clan) => clan.userId !== userId);
}