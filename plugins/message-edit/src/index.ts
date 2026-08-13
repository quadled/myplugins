import { patcher } from "@vendetta";
import { findByProps } from "@vendetta/modules";
import { React } from "@vendetta/metro/common";
import { StyleSheet, Text, View } from "react-native";

const ActionSheetModule = findByProps("openLazy", "hideActionSheet") || findByProps("showActionSheet");

// React-Komponente für das schwebende Text-Overlay
const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 50,
        right: 15,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#5865F2",
        zIndex: 99999,
        elevation: 10
    },
    text: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "bold"
    }
});

let setOverlayText: (text: string) => void = () => {};

function InspectorOverlay() {
    const [label, setLabel] = React.useState<string>("GUI Inspector: Bereit");
    setOverlayText = setLabel;

    return (
        <View style={styles.container} pointerEvents="none">
            <Text style={styles.text}>{label}</Text>
        </View>
    );
}

let unpatches: Function[] = [];

export default {
    onLoad: () => {
        // Overlay oben rechts in das Haupt-UI einhängen
        // (Nutzt das unpatch-System, um es bei Plugin-Deaktivierung zu entfernen)
        
        if (ActionSheetModule?.openLazy) {
            const unpatch = patcher.before("openLazy", ActionSheetModule, (args) => {
                const menuKey = args[1];
                const displayName = menuKey ? menuKey : "Unbekanntes Menü";
                
                // Text im schwebenden Overlay aktualisieren
                setOverlayText(`GUI: ${displayName}`);
            });
            unpatches.push(unpatch);
        } else {
            setOverlayText("GUI: Modul nicht gefunden");
        }
    },

    onUnload: () => {
        unpatches.forEach((u) => u());
        unpatches = [];
    }
};