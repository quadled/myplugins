import { findByStoreName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import Settings from "./Settings";
import { getClanTagForUser } from "./storage";

let unpatchUserStore: undefined | (() => void);
let jsxUnpatches: Array<() => void> = [];

function patchJsxClans() {
  const jsx = (window as any)?.bunny?.api?.react?.jsx;
  if (!jsx?.onJsxCreate) return;

  const unpatchClanTag = jsx.onJsxCreate("ClanTag", (_node: unknown, element: any) => {
    const userId = element?.props?.userId; 
    if (!userId) return;

    const customClan = getClanTagForUser(userId);
    if (customClan && customClan.uri) {
      if (element.props?.badge) {
        element.props.badge.badgeUrl = customClan.uri;
      }
      if (element.props?.source) {
        element.props.source = { uri: customClan.uri };
      }
    }
  });

  if (typeof unpatchClanTag === "function") jsxUnpatches.push(unpatchClanTag);
}

function patchUserStoreForClans() {
  const UserStore = findByStoreName("UserStore");
  if (!UserStore) return;

  unpatchUserStore = after("getUser", UserStore, ([userId], user) => {
    if (!user) return user;

    const customClan = getClanTagForUser(userId);
    if (customClan) {
      (user as any).clan = {
        tag: customClan.label,
        identityGuildId: "custom-clan-id",
        badge: {
          badgeUrl: customClan.uri,
          id: "custom-badge-id"
        }
      };
    }

    return user;
  });
}

export function onLoad() {
  patchJsxClans();
  patchUserStoreForClans();
}

export function onUnload() {
  unpatchUserStore?.();
  unpatchUserStore = undefined;

  for (const unpatch of jsxUnpatches) unpatch();
  jsxUnpatches = [];
}

export const settings = Settings;

export default {
  onLoad,
  onUnload,
  settings,
};