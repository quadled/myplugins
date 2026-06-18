import Settings from "./Settings";
import { addLog } from "./storage";

let unpatchInspector: (() => void) | undefined;

export function onLoad() {
  const jsx = (window as any)?.bunny?.api?.react?.jsx;
  if (!jsx?.onJsxCreate) return;

  unpatchInspector = jsx.onJsxCreate("*", (node: any, element: any) => {
    try {
      const componentName = node?.name || element?.type?.name || element?.type;
      
      if (typeof componentName === "string") {
        const nameLower = componentName.toLowerCase();
        
        // Filter nach Clan, Tag oder Guild
        if (nameLower.includes("clan") || nameLower.includes("tag") || nameLower.includes("guild")) {
          addLog(componentName, element?.props || {});
        }
      }
    } catch (e) {
      // Ignorieren, falls ein Objekt nicht gelesen werden kann
    }
  });
}

export function onUnload() {
  unpatchInspector?.();
  unpatchInspector = undefined;
}

export const settings = Settings;

export default {
  onLoad,
  onUnload,
  settings,
};