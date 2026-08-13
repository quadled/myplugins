import { patcher } from "@vendetta";
import { findByProps } from "@vendetta/modules";
import { showInputAlert } from "@vendetta/ui/alerts";
import { FluxDispatcher } from "@vendetta/metro/common";

// Modul für das Öffnen von ActionSheets/Kontextmenüs
const ActionSheetModule = findByProps("openLazy", "hideActionSheet") || findByProps("showActionSheet");
const originalTexts = new Map<string, string>();

let unpatch: () => void;

export default {
    onLoad: () => {
        if (!ActionSheetModule?.openLazy) return;

        // Wir patchen openLazy, um das Nachrichten-Menü beim Laden abzufangen
        unpatch = patcher.before("openLazy", ActionSheetModule, (args) => {
            const [component, key] = args;

            // Prüfen, ob das aufgerufene Menü das Nachrichten-Aktionsmenü ist
            if (key === "MessageActionSheet") {
                args[0] = component().then((mod: any) => {
                    const originalDef = mod.default;

                    mod.default = patcher.after("default", mod, ([{ message }], res) => {
                        if (!message) return res;

                        const isEdited = originalTexts.has(message.id);

                        // 1. Option: Lokal bearbeiten
                        const editMenuItem = {
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
                                        FluxDispatcher.dispatch({
                                            type: "MESSAGE_UPDATE",
                                            message: message
                                        });
                                    }
                                });
                            }
                        };

                        // 2. Option: Zurücksetzen
                        const resetMenuItem = {
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

                        // Sicheres Einfügen der Menüpunkte
                        if (res?.props?.rows) {
                            res.props.rows.push(editMenuItem);
                            if (isEdited) res.props.rows.push(resetMenuItem);
                        } else if (Array.isArray(res)) {
                            res.push(editMenuItem);
                            if (isEdited) res.push(resetMenuItem);
                        }

                        return res;
                    });

                    return mod;
                });
            }
        });
    },

    onUnload: () => {
        if (unpatch) unpatch();
        originalTexts.clear();
    }
};