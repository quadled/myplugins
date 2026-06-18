import { findByStoreName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import Settings from "./Settings";
import { getClanTagForUser } from "./storage";

let unpatches: Array<() => void> = [];

function patchUserStores() {
  const UserStore = findByStoreName("UserStore");
  const UserProfileStore = findByStoreName("UserProfileStore");

  // Patch 1: UserStore (Für die Anzeige direkt im Chat)
  if (UserStore) {
    const unpatchUser = after("getUser", UserStore, ([userId], user) => {
      if (!user) return user;

      const customClan = getClanTagForUser(userId);
      if (customClan) {
        const anyUser = user as any;
        
        // Exakt die Struktur aus deinem Screenshot!
        anyUser.clan = {
          tag: customClan.label,
          identityGuildId: "custom_clan_id",
          badge: {
            badgeUrl: customClan.uri,
            id: "custom_badge_id"
          }
        };
      }
      return user;
    });
    unpatches.push(unpatchUser);
  }

  // Patch 2: UserProfileStore (Für die große Profilkarte beim Anklicken)
  if (UserProfileStore) {
    const unpatchProfile = after("getUserProfile", UserProfileStore, ([userId], profile) => {
      if (!profile) return profile;

      const customClan = getClanTagForUser(userId);
      if (customClan) {
        const anyProfile = profile as any;
        
        // Dieselbe Struktur auch fürs Profil
        anyProfile.clan = {
          tag: customClan.label,
          identityGuildId: "custom_clan_id",
          badge: {
            badgeUrl: customClan.uri,
            id: "custom_badge_id"
          }
        };
      }
      return profile;
    });
    unpatches.push(unpatchProfile);
  }
}

export function onLoad() {
  patchUserStores();
}

export function onUnload() {
  for (const unpatch of unpatches) unpatch();
  unpatches = [];
}

export const settings = Settings;
export default { onLoad, onUnload, settings };