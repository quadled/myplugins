import Settings from "./Settings";
import { addLog } from "./storage";

let unpatchInspector: (() => void) | undefined;

export function onLoad() {
  const jsx = (window as any)?.bunny?.api?.react?.jsx;
  if (!jsx?.onJsxCreate) {
    addLog("FEHLER", { msg: "bunny.api.react.jsx nicht gefunden!" });
    return;
  }

  addLog("SYSTEM", { msg: "Gnadenloser Voll-Log gestartet! Wechsle jetzt den Kanal." });

  // Wir fangen absolut JEDES Element ab, ohne Ausnahme
  unpatchInspector = jsx.onJsxCreate("*", (node: any, element: any) => {
    try {
      const componentName = node?.name || element?.type?.name || element?.type;
      
      if (componentName) {
        const props = element?.props || {};
        const cleanProps: Record<string, any> = {};

        // Wir filtern nur riesige Unter-Objekte raus, damit die Textboxen lesbar bleiben
        for (const key of Object.keys(props)) {
          if (key === "children" || key === "style" || key === "theme") continue;
          
          // Wenn das Prop ein riesiges Objekt ist, kürzen wir es ab
          if (typeof props[key] === "object" && props[key] !== null) {
            cleanProps[key] = "{...}"; 
          } else {
            cleanProps[key] = props[key];
          }
        }

        // Ab in deine Console damit!
        addLog(String(componentName), cleanProps);
      }
    } catch (e) {
      // Ignorieren
    }
  });
}

export function onUnload() {
  unpatchInspector?.();
  unpatchInspector = undefined;
}

export const settings = Settings;
export default { onLoad, onUnload, settings };