import { findByName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import Settings from "./Settings";
import { getBadgeForUser } from "./storage";

const badgePropsMap: Record<string, any> = {};
let unpatchBadges: undefined | (() => void);
let jsxUnpatches: Array<() => void> = [];

function patchJsxBadges() {
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

  if (typeof unpatchProfileBadge === "function") jsxUnpatches.push(unpatchProfileBadge);
  if (typeof unpatchRenderBadge === "function") jsxUnpatches.push(unpatchRenderBadge);
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

export function onLoad() {
  patchJsxBadges();
  patchUseBadges();
}

export function onUnload() {
  unpatchBadges?.();
  unpatchBadges = undefined;

  for (const unpatch of jsxUnpatches) unpatch();
  jsxUnpatches = [];
}

export const settings = Settings;

export default {
  onLoad,
  onUnload,
  settings,
};
