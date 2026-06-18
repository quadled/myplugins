import { findByStoreName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import Settings from "./Settings";
import { addLog } from "./storage";

let unpatches: Array<() => void> = [];

export function onLoad() {
  const UserStore = findByStoreName("UserStore");
  const UserProfileStore = findByStoreName("UserProfileStore");

  addLog("SYSTEM", { msg: "DevHandler aktiv. Stores werden ueberwacht!" });

  if (UserStore) {
    const unpatchUser = after("getUser", UserStore, ([userId], user) => {
      if (user) {
        addLog(`UserStore (ID: ${userId})`, { name: user.username, clan: user.clan || null });
      }
      return user;
    });
    unpatches.push(unpatchUser);
  }

  if (UserProfileStore) {
    const unpatchProfile = after("getUserProfile", UserProfileStore, ([userId], profile) => {
      if (profile) {
        addLog(`UserProfileStore (ID: ${userId})`, { clanData: profile.clan || null });
      }
      return profile;
    });
    unpatches.push(unpatchProfile);
  }
}

export function onUnload() {
  for (const unpatch of unpatches) unpatch();
  unpatches = [];
}

export const settings = Settings;
export default { onLoad, onUnload, settings };