import { findByStoreName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import Settings from "./Settings";
import { getClanTagForUser } from "./storage";

let unpatches: Array<() => void> = [];

function patchUserStores() {
  const UserStore = findByStoreName("UserStore");
  const UserProfileStore = findByStoreName("UserProfileStore");

  // Patch 1: Der normale UserStore (wichtig für den Chat)
  if (UserStore) {
    const unpatchUser = after("getUser", UserStore, ([userId], user) => {
      if (!user) return user;

      const customClan = getClanTagForUser(userId);
      if (customClan) {
        // Wir faken die exakte native Clan-Struktur von Discord
        user.clan = {
          tag: customClan.label,
          badgeUrl: customClan.uri,
          identityGuildId: "1234567890", // Fake ID damit Discord es als echten Clan wertet
          identityProfileTheme: 1
        };
        // Für ältere Fallbacks im Client
        user.clanTag = customClan.label;
      }
      return user;
    });
    unpatches.push(unpatchUser);
  }

  // Patch 2: Der UserProfileStore (wichtig für die Profilkarte beim Anklicken)
  if (UserProfileStore) {
    const unpatchProfile = after("getUserProfile", UserProfileStore, ([userId], profile) => {
      if (!profile) return profile;

      const customClan = getClanTagForUser(userId);
      if (customClan) {
        profile.clan = {
          tag: customClan.label,
          badgeUrl: customClan.uri,
          identityGuildId: "1234567890",
          identityProfileTheme: 1
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