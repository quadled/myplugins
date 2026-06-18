import { findByName, findByStoreName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import Settings from "./Settings";
import { getBadgeForUser, getClanTagForUser } from "./storage"; // getClanTagForUser fügen wir gleich hinzu

const badgePropsMap: Record<string, any> = {};
const clanIconMap: Record<string, string> = {}; // Speichert die URLs für die Clan-Icons
let unpatchBadges: undefined | (() => void);
let unpatchUserStore: undefined | (() => void);
let jsxUnpatches: Array<() => void> = [];

function patchJsxBadgesAndClans() {
  const jsx = (window as any)?.bunny?.api?.react?.jsx;
  if (!jsx?.onJsxCreate) return;

  // --- HIER SIND DEINE BESTEHENDEN BADGE PATCHES ---
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

  // --- HIER IST DER NEUE CLAN-TAG PATCH ---
  // Wir suchen nach der Komponente, die das Clan-Icon anzeigt
  const unpatchClanTag = jsx.onJsxCreate("ClanTag", (_node: unknown, element: any) => {
    const userId = element?.props?.userId; 
    if (!userId) return;

    const customClan = getClanTagForUser(userId);
    if (customClan && customClan.uri) {
      // Wenn ein Custom-Icon hinterlegt ist, überschreiben wir die Bildquelle
      if (element.props?.badge?.badgeUrl) {
        element.props.badge.badgeUrl = customClan.uri;
      }
      // Zur Sicherheit auch für die Standard-Source Props, falls Discord das Layout ändert
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
  // ... (Dein originaler useBadges Code bleibt hier unverändert) ...
}

function patchUserStoreForClans() {
  const UserStore = findByStoreName("UserStore");
  if (!UserStore) return;

  // Wir klinken uns in die getUser-Methode ein, um Discord vorzugaukeln, der User hätte einen Clan
  unpatchUserStore = after("getUser", UserStore, ([userId], user) => {
    if (!user) return user;

    const customClan = getClanTagForUser(userId);
    if (customClan) {
      user.clan = {
        tag: customClan.label, // Das ist der Text, z.B. "Qrew"
        identityGuildId: "custom-clan-id",
        badge: {
          badgeUrl: customClan.uri, // Temporäre Zuweisung für unseren JSX Patch
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
  patchUserStoreForClans(); // Aktiviert den Clan-Patcher
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
export default { onLoad, onUnload, settings };