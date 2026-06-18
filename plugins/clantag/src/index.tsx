import { findByName, findByStoreName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import Settings from "./Settings";
import { getBadgeForUser, getClanTagForUser } from "./storage";

const badgePropsMap: Record<string, any> = {};
let unpatchBadges: undefined | (() => void);
let unpatchUserStore: undefined | (() => void);
let jsxUnpatches: Array<() => void> = [];

function patchJsxBadgesAndClans() {
  const jsx = (window as any)?.bunny?.api?.react?.jsx;
  if (!jsx?.onJsxCreate) return;

  const unpatchProfileBadge = jsx.onJsxCreate("ProfileBadge", (_node: unknown, element: any) => {
    if (!element?.props?.id?.startsWith("cb-")) return;

    const props = badgePropsMap[element.props.id];
    if (!props) return;

    element.props.source = props.source;
    element.props.label = props.label;
    element.props.id = props.id;
  });

  const unpatchRenderBadge = jsx.onJsxCreate("RenderBadge", (_node: unknown, element: any) => {
    if (!element?.props?.id?.startsWith("cb-")) return;

    const props = badgePropsMap[element.props.id];
    if (props) Object.assign(element.props, props);
  });

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

  if (typeof unpatchProfileBadge === "function") jsxUnpatches.push(unpatchProfileBadge);
  if (typeof unpatchRenderBadge === "function") jsxUnpatches.push(unpatchRenderBadge);
  if (typeof unpatchClanTag === "function") jsxUnpatches.push(unpatchClanTag);
}

function patchUseBadges() {
  const useBadgesModule = findByName("useBadges", false);
  if (!useBadgesModule?.default) return;

  unpatchBadges = after("default", useBadgesModule, ([user], badgeList) => {
    const userId = user?.userId ?? user?.id;
    if (!userId || !Array.isArray(badgeList)) return badgeList;

    const badges = getBadgeForUser(userId);

    for (const badge of badges) {
      const badgeId = `cb-${badge.type}`;

      badgePropsMap[badgeId] = {
        id: badgeId,
        source: { uri: badge.uri },
        label: badge.label,
        userId,
      };

      if (!badgeList.some((existingBadge: any) => existingBadge?.id === badgeId)) {
        badgeList.push({
          id: badgeId,
          description: badge.label,
          icon: "dummy",
        });
      }
    }

    return badgeList;
  });
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
  patchJsxBadgesAndClans();
  patchUseBadges();
  patchUserStoreForClans();
}

export function onUnload() {
  unpatchBadges?.();
  unpatchBadges = undefined;
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