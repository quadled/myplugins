import { ReactNative } from "@vendetta/metro/common";
import Settings from "./Settings"; // Kannst deine leere oder alte Settings-Datei lassen

let unpatchInspector: (() => void) | undefined;

export function onLoad() {
  const jsx = (window as any)?.bunny?.api?.react?.jsx;
  if (!jsx?.onJsxCreate) {
    console.log("[Inspector] Fehler: bunny.api.react.jsx wurde nicht gefunden!");
    return;
  }

  console.log("[Inspector] Plugin erfolgreich geladen. Suche nach Clan-Komponenten...");

  // Dieser Hook fängt jedes neu gezeichnete Element ab
  unpatchInspector = jsx.onJsxCreate("*", (node: any, element: any) => {
    // Ermittle den Namen der React-Komponente
    const componentName = node?.name || element?.type?.name || element?.type;
    
    if (typeof componentName === "string") {
      const nameLower = componentName.toLowerCase();
      
      // Wir filtern nach interessanten Begriffen rund um Clans und Tags
      if (nameLower.includes("clan") || nameLower.includes("tag") || nameLower.includes("guild")) {
        
        // Das schreibt den Namen und alle Props (id, userId, etc.) direkt in deine App-Logs
        console.log(`[Inspector] GEFUNDEN: ${componentName}`, JSON.stringify(element?.props || {}));
      }
    }
  });
}

export function onUnload() {
  if (typeof unpatchInspector === "function") {
    unpatchInspector();
  }
  unpatchInspector = undefined;
  console.log("[Inspector] Entladen.");
}

export const settings = Settings;

export default {
  onLoad,
  onUnload,
  settings,
};