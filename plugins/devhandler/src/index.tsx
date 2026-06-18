import { findByStoreName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import Settings from "./Settings";
import { getClanTagForUser } from "./storage";

let unpatches: Array<() => void> = [];

function patchUserStores() {
  const UserStore = findByStoreName("UserStore");
  const UserProfileStore = findByStoreName("UserProfileStore");

  // Patch 1: Der normale UserStore (für den Chat im neuen Design)
  if (UserStore) {
    const unpatchUser = after("getUser", UserStore, ([userId], user) => {
      if (!user) return user;

      const customClan = getClanTagForUser(userId);
      if (customClan) {
        // Wir nutzen "as any", damit der TypeScript-Compiler beim Deploy nicht meckert
        const anyUser = user as any;
        
        anyUser.clan = {
          tag: customClan.label,
          badgeUrl: customClan.uri,
          identityGuildId: "1234567890", // Fake-ID, die das neue Design triggert
          identityProfileTheme: 1
        };
        anyUser.clanTag = customClan.label;
      }
      return user;
    });
    unpatches.push(unpatchUser);
  }

  // Patch 2: Der UserProfileStore (für Profilkarten im neuen Design)
  if (UserProfileStore) {
    const unpatchProfile = after("getUserProfile", UserProfileStore, ([userId], profile) => {
      if (!profile) return profile;

      const customClan = getClanTagForUser(userId);
      if (customClan) {
        const anyProfile = profile as any;
        
        anyProfile.clan = {
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