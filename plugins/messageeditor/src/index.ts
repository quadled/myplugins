import { patcher } from "@vendetta";
import { findByProps } from "@vendetta/modules";
import { showInputAlert } from "@vendetta/ui/alerts";
import { FluxDispatcher } from "@vendetta/metro/common";

const ActionSheetItems = findByProps("useMessageMenuItems", "default");

// Speichert die ursprünglichen Texte: [MessageID, OriginalContent]
const originalTexts = new Map<string, string>();

let unpatch: () => void;

export default {
    onLoad: () => {
        unpatch = patcher.after("default", ActionSheetItems, ([{ message }], res) => {
            if (!message || !res) return;

            const isEdited = originalTexts.has(message.id);

            // 1. Option: Nachricht lokal bearbeiten
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

                            // Originaltext beim ersten Bearbeiten sichern
                            if (!originalTexts.has(message.id)) {
                                originalTexts.set(message.id, message.content);
                            }

                            // Text ändern & Chat neu rendern
                            message.content = newContent;
                            FluxDispatcher.dispatch({
                                type: "MESSAGE_UPDATE",
                                message: message
                            });
                        }
                    });
                }
            };

            // 2. Option: Nachricht auf Originaltext zurücksetzen
            const resetMenuItem = {
                label: "Originaltext wiederherstellen",
                onPress: () => {
                    const originalContent = originalTexts.get(message.id);
                    if (originalContent !== undefined) {
                        // Text zurücksetzen
                        message.content = originalContent;
                        
                        // Aus der Map entfernen
                        originalTexts.delete(message.id);

                        // Chat neu rendern
                        FluxDispatcher.dispatch({
                            type: "MESSAGE_UPDATE",
                            message: message
                        });
                    }
                }
            };

            // Menüpunkte in das ActionSheet einfügen
            const itemsToPush = [editMenuItem];
            if (isEdited) {
                itemsToPush.push(resetMenuItem);
            }

            if (Array.isArray(res)) {
                res.push(...itemsToPush);
            } else if (res.props?.children) {
                res.props.children.push(...itemsToPush);
            }
        });
    },

    onUnload: () => {
        if (unpatch) unpatch();
        originalTexts.clear();
    }
};