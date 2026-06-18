import { findByName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";

type Badge = {
  type: string;
  label: string;
  uri: string;
};

const PRESET_BADGES: Record<string, Omit<Badge, "type">> = {
  developer: {
    label: "Developer",
    uri: "https://cdn.discordapp.com/emojis/860165259117199401.webp",
  },
  designer: {
    label: "Designer",
    uri: "https://cdn.discordapp.com/emojis/886587553187246120.webp",
  },
  booster: {
    label: "Server Booster",
    uri: "https://cdn.discordapp.com/emojis/859801776232202280.webp",
  },
  owner: {
    label: "Server Owner",
    uri: "https://cdn.discordapp.com/emojis/860165259117199401.webp",
  },
};

const BADGE_CONFIG: Record<string, Array<string | Badge>> = {
  "123456789012345678": ["developer", "owner"],
};

function resolveBadgesForUser(userId: string) {
  const entries = BADGE_CONFIG[userId];
  if (!entries) return [];

  const badges: Badge[] = [];

  for (const entry of entries) {
    if (typeof entry === "string") {
      const preset = PRESET_BADGES[entry];
      if (!preset) continue;

      badges.push({
        type: entry,
        label: preset.label,
        uri: preset.uri,
      });

      continue;
    }

    if (!entry.uri.startsWith("https://") && !entry.uri.startsWith("http://")) continue;
    badges.push(entry);
  }

  return badges;
}

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

    const badges = resolveBadgesForUser(userId);

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

export default {
  onLoad: () => {
    patchJsxBadges();
    patchUseBadges();
  },
  onUnload: () => {
    unpatchBadges?.();
    unpatchBadges = undefined;

    for (const unpatch of jsxUnpatches) unpatch();
    jsxUnpatches = [];
  },
};
