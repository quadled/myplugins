import { React, ReactNative } from "@vendetta/metro/common";
import { Forms } from "@vendetta/ui/components";
import { internalLogs, clearLogs, registerLogListener, unregisterLogListener } from "./storage";

const { FormSection, FormText, FormRow, FormDivider } = Forms;
const { ScrollView, Text, Pressable, View } = ReactNative;

export default function Settings() {
  const [logs, setLogs] = React.useState([...internalLogs]);

  // Dieser Effekt sorgt dafür, dass sich die Liste live updatet
  React.useEffect(() => {
    registerLogListener(() => {
      setLogs([...internalLogs]);
    });
    return () => unregisterLogListener();
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#1e1f22" }}>
      <FormSection title="Clan-Tag Live Inspector">
        <FormText style={{ marginHorizontal: 16, marginBottom: 10, color: "#949ba4" }}>
          Klicke im Chat auf ein Profil mit Clan-Tag. Die erfassten Daten erscheinen sofort hier drunter:
        </FormText>

        <Pressable 
          onPress={() => clearLogs()} 
          style={{ 
            backgroundColor: "#da373c", 
            padding: 10, 
            marginHorizontal: 16, 
            borderRadius: 6, 
            alignItems: "center",
            marginBottom: 15
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "bold" }}>Konsole leeren</Text>
        </Pressable>

        <FormDivider />

        <View style={{ marginHorizontal: 16, marginTop: 10 }}>
          {logs.length === 0 ? (
            <Text style={{ color: "#949ba4", fontStyle: "italic", textAlign: "center", marginTop: 20 }}>
              Noch keine Clan-Komponenten erfasst...
            </Text>
          ) : (
            // Wir mappen die Logs rückwärts, damit das Neueste oben steht
            [...logs].reverse().map((log) => (
              <View 
                key={log.id} 
                style={{ 
                  backgroundColor: "#2b2d31", 
                  padding: 10, 
                  borderRadius: 6, 
                  marginBottom: 10,
                  borderLeftWidth: 4,
                  borderLeftColor: "#5865f2"
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "between", marginBottom: 5 }}>
                  <Text style={{ color: "#3ba55d", fontWeight: "bold" }}>{log.component}</Text>
                  <Text style={{ color: "#949ba4", fontSize: 12 }}>{log.time}</Text>
                </View>
                <Text 
                  style={{ 
                    color: "#e3e5e8", 
                    fontFamily: "monospace", 
                    fontSize: 12, 
                    backgroundColor: "#1e1f22", 
                    padding: 6, 
                    borderRadius: 4 
                  }}
                >
                  {log.props}
                </Text>
              </View>
            ))
          )}
        </View>
      </FormSection>
    </ScrollView>
  );
}