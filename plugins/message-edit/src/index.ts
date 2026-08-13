import { patcher } from "@vendetta";
import { findByProps, findByStoreName } from "@vendetta/modules";
import { showInputAlert } from "@vendetta/ui/alerts";
import { FluxDispatcher } from "@vendetta/metro/common";

// Speichert die Ursprungstexte
const originalTexts = new Map<string, string>();

let unpatches: Function[] = [];

export default {
    onLoad: () => {
        // Wir suchen alle Module, die Menüpunkte für Nachrichten bereitstellen
        const menuModules = [
            findByProps("useMessageMenuItems"),
            findByProps("getMessageMenuItems"),
            findByProps("default", "useMessageMenuItems")
        ].filter(Boolean);

        if (menuModules.length === 0) {
            console.log("[EditPlugin] Kein passendes Menü-Modul gefunden.");
            return;
        }

        menuModules.forEach((mod) => {
            const targetMethod = mod.useMessageMenuItems ? "useMessageMenuItems" : "default";

            const unpatch = patcher.after(targetMethod, mod, (args, res) => {
                // Das erste Argument ist das Objekt mit der Nachricht
                const message = args[0]?.message || args[0];
                if (!message?.id || !res) return res;

                const isEdited = originalTexts.has(message.id);

                // Option 1: Bearbeiten
                const editItem = {
                    label: "Nachricht (lokal) bearbeiten",
                    onPress: () => {
                        showInputAlert({
                            title: "Nachricht bearbeiten",
                            placeholder: "Neuer Text...",
                            initialValue: message.content,
                            confirmText: "Speichern",
                            cancelText: "Abbrechen",
                            onConfirm: (newContent: string) => {
                                if (newContent === undefined) return;

                                if (!originalTexts.has(message.id)) {
                                    originalTexts.set(message.id, message.content);
                                }

                                message.content = newContent;

                                // Chat neu rendern
                                FluxDispatcher.dispatch({
                                    type: "MESSAGE_UPDATE",
                                    message: message
                                });
                            }
                        });
                    }
                };

                // Option 2: Zurücksetzen
                const resetItem = {
                    label: "Originaltext wiederherstellen",
                    onPress: () => {
                        const originalContent = originalTexts.get(message.id);
                        if (originalContent !== undefined) {
                            message.content = originalContent;
                            originalTexts.delete(message.id);

                            FluxDispatcher.dispatch({
                                type: "MESSAGE_UPDATE",
                                message: message
                            });
                        }
                    }
                };

                // Array sicher erweitern (egal welche Datenstruktur Discord nutzt)
                if (Array.isArray(res)) {
                    res.push(editItem);
                    if (isEdited) res.push(resetItem);
                } else if (res?.props?.children) {
                    if (Array.isArray(res.props.children)) {
                        res.props.children.push(editItem);
                        if (isEdited) res.props.children.push(resetItem);
                    }
                }

                return res;
            });

            unpatches.push(unpatch);
        });
    },

    onUnload: () => {
        unpatches.forEach((u) => u());
        unpatches = [];
        originalTexts.clear();
    }
};