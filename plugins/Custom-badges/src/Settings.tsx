import { React, ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { Forms } from "@vendetta/ui/components";
import { addBadge, getBadges, removeBadge } from "./storage";

const { FormSection, FormText, FormRow, FormDivider } = Forms;
const { Image, Pressable, ScrollView, Text, TextInput, View } = ReactNative;

const inputStyle = {
  backgroundColor: "#2b2d31",
  borderRadius: 6,
  color: "#ffffff",
  marginHorizontal: 16,
  marginTop: 10,
  paddingHorizontal: 12,
  paddingVertical: 10,
};

export default function Settings() {
  useProxy(storage);

  const [userId, setUserId] = React.useState("");
  const [label, setLabel] = React.useState("");
  const [uri, setUri] = React.useState("");
  const [refresh, setRefresh] = React.useState(0);

  const badges = getBadges();

  return (
    <ScrollView>
    <FormSection title="Custom Badges">
      <FormText>
        Badges sind lokal sichtbar. Andere sehen sie nur, wenn sie dieses Plugin auch installiert haben.
      </FormText>

      <TextInput
        style={inputStyle}
        value={userId}
        onChangeText={setUserId}
        placeholder="Discord User ID"
        placeholderTextColor="#949ba4"
      />

      <TextInput
        style={inputStyle}
        value={label}
        onChangeText={setLabel}
        placeholder="z.B. Owner"
        placeholderTextColor="#949ba4"
      />

      <TextInput
        style={inputStyle}
        value={uri}
        onChangeText={setUri}
        placeholder="https://..."
        placeholderTextColor="#949ba4"
        autoCapitalize="none"
      />

      <Pressable
        onPress={() => {
          const cleanUserId = userId.trim();
          const cleanLabel = label.trim();
          const cleanUri = uri.trim();
          if (!cleanUserId || !cleanLabel || !cleanUri) return;
          if (!cleanUri.startsWith("https://") && !cleanUri.startsWith("http://")) return;

          addBadge(cleanUserId, cleanLabel, cleanUri);
          setUserId("");
          setLabel("");
          setUri("");
          setRefresh(refresh + 1);
        }}
      >
        <FormRow label="Badge hinzufuegen" />
      </Pressable>

      <FormDivider />

      {badges.length === 0 ? (
        <FormText>Noch keine Badges gespeichert.</FormText>
      ) : (
        badges.map((badge) => (
          <View key={badge.type}>
            <Pressable
              onPress={() => {
                removeBadge(badge.type);
                setRefresh(refresh + 1);
              }}
            >
              <FormRow
                label={badge.label}
                subLabel={badge.userId}
                leading={React.createElement(Image, {
                  source: { uri: badge.uri },
                  style: { width: 24, height: 24, borderRadius: 4 },
                })}
                trailing={React.createElement(Text, { style: { color: "#ed4245" } }, "Loeschen")}
              />
            </Pressable>
            <FormDivider />
          </View>
        ))
      )}
    </FormSection>
    </ScrollView>
  );
}
