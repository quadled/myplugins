import { React, ReactNative } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";
import { findByProps } from "@vendetta/metro";
import Settings from "./Settings";
import { getBadgeForUser } from "./storage";

let unpatches: Array<() => void> = [];

function makeBadge(label: string) {
  return React.createElement(
    ReactNative.Text,
    {
      style: {
        backgroundColor: "#5865f2",
        borderRadius: 4,
        color: "#ffffff",
        fontSize: 11,
        fontWeight: "700",
        marginLeft: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
      },
    },
    label,
  );
}

function appendBadgeToTree(node: any, userId: string): any {
  const badge = getBadgeForUser(userId);
  if (!badge) return node;

  const children = node?.props?.children;
  if (!Array.isArray(children)) return node;

  if (children.some((child) => child?.props?.quadledCustomBadge)) return node;

  children.push(
    React.cloneElement(makeBadge(badge.label), {
      key: `quadled-custom-badge-${userId}`,
      quadledCustomBadge: true,
    }),
  );

  return node;
}

function patchPossibleBadgeRows() {
  const candidates = [
    findByProps("UserProfileBadges"),
    findByProps("ProfileBadges"),
    findByProps("BadgeList"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    for (const key of Object.keys(candidate)) {
      if (typeof candidate[key] !== "function") continue;

      const unpatch = after(key, candidate, ([props], result) => {
        const userId = props?.user?.id ?? props?.userId ?? props?.profile?.user?.id;
        if (!userId) return result;

        return appendBadgeToTree(result, userId);
      });

      unpatches.push(unpatch);
    }
  }
}

export default {
  onLoad: () => {
    patchPossibleBadgeRows();
  },
  onUnload: () => {
    for (const unpatch of unpatches) unpatch();
    unpatches = [];
  },
  settings: Settings,
};
