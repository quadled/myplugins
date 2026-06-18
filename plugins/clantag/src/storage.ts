import { storage } from "@vendetta/plugin";

export type CustomItem = {
  userId: string;
  type: string;
  label: string;
  uri: string;
};

type EnhancedStorage = {
  clanTags?: CustomItem[];
};

const data = storage as EnhancedStorage;

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