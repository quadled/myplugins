import { findByProps, findByStoreName } from "@vendetta/metro"
import { FluxDispatcher, React, ReactNative, stylesheet } from "@vendetta/metro/common"
import { before, after } from "@vendetta/patcher"
import { semanticColors } from "@vendetta/ui"
import { getAssetIDByName } from "@vendetta/ui/assets"
import { Forms } from "@vendetta/ui/components"
import { findInReactTree } from "@vendetta/utils"
import { logger } from "@vendetta"
import { showToast } from "@vendetta/ui/toasts"
import { showConfirmationAlert } from "@vendetta/ui/alerts"

// Globale Variablen & Stores
let LazyActionSheet: any
let hideActionSheet: any
let ActionSheetRow: any
let MessageStore: any
let ChannelStore: any
let styles: any

// Speichert bearbeitete Nachrichten (Message-ID -> Originaler Text)
const originalMessages = new Map<string, string>()
const patchedActionSheets = new WeakSet()

let activeUnpatches: Array<() => void> = []

function patchActionSheets(): () => void {
    LazyActionSheet ??= findByProps("openLazy", "hideActionSheet")
    hideActionSheet ??= findByProps("hideActionSheet")?.hideActionSheet
    ActionSheetRow ??= findByProps("ActionSheetRow")?.ActionSheetRow ?? Forms.FormRow
    MessageStore ??= findByStoreName("MessageStore")
    ChannelStore ??= findByStoreName("ChannelStore")
    
    styles ??= stylesheet.createThemedStyleSheet({
        iconComponent: {
            width: 24,
            height: 24,
            tintColor: semanticColors.INTERACTIVE_NORMAL
        },
        inputField: {
            color: semanticColors.TEXT_NORMAL,
            backgroundColor: semanticColors.BACKGROUND_SECONDARY,
            borderRadius: 8,
            padding: 10,
            marginTop: 10,
            minHeight: 80,
            textAlignVertical: "top"
        }
    })

    if (!LazyActionSheet) {
        throw new Error("LazyActionSheet-Modul konnte nicht gefunden werden.")
    }

    const unpatches: Array<() => void> = []
    let currentMessage: any

    const beforeUnpatch = before("openLazy", LazyActionSheet, ([component, key, msg]) => {
        const message = msg?.message
        if (typeof key !== "string" || !key.endsWith("MessageLongPressActionSheet")) return

        if (message) currentMessage = message

        component.then((instance: any) => {
            if (patchedActionSheets.has(instance)) return
            patchedActionSheets.add(instance)

            const moduleUnpatch = after("default", instance, (_, comp) => {
                const message = currentMessage
                const buttons = findInReactTree(comp, (x: any) => x?.[0]?.type?.name === "ActionSheetRow")
                if (!buttons) return

                const dismissActionSheet = () => {
                    if (hideActionSheet) hideActionSheet()
                    else LazyActionSheet?.hideActionSheet?.()
                }

                if (buttons.some((x: any) => x?.key === "local-edit-button")) return

                const originalMessage = MessageStore?.getMessage(message?.channel_id, message?.id)
                if (!originalMessage && !message) return

                const messageId = originalMessage?.id ?? message?.id
                const channelId = (originalMessage || message).channel_id
                const currentContent = originalMessage?.content ?? message?.content ?? ""
                const isEdited = originalMessages.has(messageId)

                // 1. Aktion: Nachricht lokal bearbeiten
                const openEditModal = () => {
                    dismissActionSheet()
                    let updatedText = currentContent

                    showConfirmationAlert({
                        title: "Nachricht lokal bearbeiten",
                        content: (
                            <ReactNative.TextInput
                                defaultValue={currentContent}
                                onChangeText={(val: string) => { updatedText = val }}
                                multiline={true}
                                style={styles.inputField}
                                placeholder="Neuer Text..."
                                placeholderTextColor="#888"
                            />
                        ),
                        confirmText: "Speichern",
                        cancelText: "Abbrechen",
                        onConfirm: () => {
                            // Ersten Zustand speichern für spätere Wiederherstellung
                            if (!originalMessages.has(messageId)) {
                                originalMessages.set(messageId, currentContent)
                            }

                            // Flux-Store lokal aktualisieren
                            FluxDispatcher.dispatch({
                                type: "MESSAGE_UPDATE",
                                message: {
                                    id: messageId,
                                    channel_id: channelId,
                                    content: updatedText,
                                    guild_id: ChannelStore?.getChannel(channelId)?.guild_id,
                                },
                                log_edit: false,
                                otherPluginBypass: true
                            })

                            showToast("Nachricht lokal geändert", getAssetIDByName("Check"))
                        }
                    })
                }

                // 2. Aktion: Originalen Text wiederherstellen
                const revertEdit = () => {
                    dismissActionSheet()
                    const originalText = originalMessages.get(messageId)

                    if (originalText !== undefined) {
                        FluxDispatcher.dispatch({
                            type: "MESSAGE_UPDATE",
                            message: {
                                id: messageId,
                                channel_id: channelId,
                                content: originalText,
                                guild_id: ChannelStore?.getChannel(channelId)?.guild_id,
                            },
                            log_edit: false,
                            otherPluginBypass: true
                        })

                        originalMessages.delete(messageId)
                        showToast("Original wiederhergestellt", getAssetIDByName("Check"))
                    }
                }

                // Buttons im Discord-Menü einfügen
                buttons.splice(1, 0, (
                    <ActionSheetRow
                        key="local-edit-button"
                        label="Nachricht lokal bearbeiten"
                        icon={
                            <ActionSheetRow.Icon
                                source={getAssetIDByName("ic_edit_24px") || getAssetIDByName("PencilIcon")}
                                IconComponent={() => (
                                    <ReactNative.Image
                                        resizeMode="cover"
                                        style={styles.iconComponent}
                                        source={getAssetIDByName("ic_edit_24px") || getAssetIDByName("PencilIcon")}
                                    />
                                )}
                            />
                        }
                        onPress={openEditModal}
                    />
                ))

                if (isEdited) {
                    buttons.splice(2, 0, (
                        <ActionSheetRow
                            key="local-revert-button"
                            label="Original wiederherstellen"
                            icon={
                                <ActionSheetRow.Icon
                                    source={getAssetIDByName("ic_undo_24px") || getAssetIDByName("ic_highlight")}
                                    IconComponent={() => (
                                        <ReactNative.Image
                                            resizeMode="cover"
                                            style={styles.iconComponent}
                                            source={getAssetIDByName("ic_undo_24px") || getAssetIDByName("ic_highlight")}
                                        />
                                    )}
                                />
                            }
                            onPress={revertEdit}
                        />
                    ))
                }
            })

            unpatches.push(moduleUnpatch)
        })
    })

    unpatches.push(beforeUnpatch)

    return () => {
        unpatches.forEach(unpatch => {
            try { unpatch() } catch (_) {}
        })
    }
}

// Vendetta Plugin Lifecycle
export default {
    onLoad: () => {
        try {
            logger.log("[Local Message Edit] Plugin geladen...")
            const unpatch = patchActionSheets()
            if (unpatch) activeUnpatches.push(unpatch)
            showToast("Local Message Edit geladen", getAssetIDByName("Check"))
        } catch (e) {
            logger.error("[Local Message Edit] Fehler beim Laden:", e)
            showToast("Fehler beim Laden!", getAssetIDByName("Small"))
        }
    },
    onUnload: () => {
        try {
            logger.log("[Local Message Edit] Plugin entladen...")
            for (const unpatch of activeUnpatches) {
                unpatch()
            }
            activeUnpatches = []
            originalMessages.clear()
            showToast("Local Message Edit deaktiviert", getAssetIDByName("Check"))
        } catch (e) {
            logger.error("[Local Message Edit] Fehler beim Entladen:", e)
        }
    }
}