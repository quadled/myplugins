let unpatchInspector: (() => void) | undefined;

export function onLoad() {
  const jsx = (window as any)?.bunny?.api?.react?.jsx;
  if (!jsx?.onJsxCreate) {
    console.log("[Inspector] Fehler: bunny.api.react.jsx wurde nicht gefunden!");
    return;
  }

  console.log("[Inspector] Plugin geladen. Suche nach Komponenten...");

  // Registriert den globalen Wildcard-Patch (*)
  unpatchInspector = jsx.onJsxCreate("*", (node: any, element: any) => {
    try {
      const componentName = node?.name || element?.type?.name || element?.type;
      
      if (typeof componentName === "string") {
        const nameLower = componentName.toLowerCase();
        
        // Filtert nach allem, was mit Clans, Tags oder Guilds zu tun hat
        if (nameLower.includes("clan") || nameLower.includes("tag") || nameLower.includes("guild")) {
          console.log(`[Inspector] GEFUNDEN: ${componentName} -> ` + JSON.stringify(element?.props || {}));
        }
      }
    } catch (e) {
      // Verhindert, dass Fehler beim Stringify den Client crashen
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

// Wir definieren ein leeres Inline-React-Element für die Settings, 
// damit wir keine separate Settings-Datei importieren müssen!
export const settings = () => null;

export default {
  onLoad,
  onUnload,
  settings,
};