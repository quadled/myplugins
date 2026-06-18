import { storage } from "@vendetta/plugin";

export type CustomClan = {
  userId: string;
  label: string;
  uri: string;
};

type EnhancedStorage = {
  clanTags?: CustomClan[];
};

const data = storage as EnhancedStorage;

export function getClanTags(): CustomClan[] {
  data.clanTags ??= [];
  return data.clanTags;
}

export function getClanTagForUser(userId: string): CustomClan | undefined {
  return getClanTags().find((clan) => clan.userId === userId);
}

export function addClanTag(userId: string, label: string, uri: string): void {
  const clans = getClanTags();
  const existing = clans.find((clan) => clan.userId === userId);

  if (existing) {
    existing.label = label;
    existing.uri = uri;
  } else {
    clans.push({ userId, label, uri });
  }
}

export function removeClanTag(userId: string): void {
  data.clanTags = getClanTags().filter((clan) => clan.userId !== userId);
}