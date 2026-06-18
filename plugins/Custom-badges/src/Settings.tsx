import { React, ReactNative } from "@vendetta/metro/common";
import { Forms } from "@vendetta/ui/components";
import { addBadge, getBadges, removeBadge } from "./storage";

const { FormSection, FormText, FormRow, FormInput, FormDivider } = Forms;
const { Image, View, Text, TouchableOpacity } = ReactNative;

export default function Settings() {
  const [userId, setUserId] = React.useState("");
  const [label, setLabel] = React.useState("");
  const [uri, setUri] = React.useState("");
  const [refresh, setRefresh] = React.useState(0);

  const badges = getBadges();

  return (
    <FormSection title="Custom Badges">
      <FormText>
        Badges sind lokal sichtbar. Andere sehen sie nur, wenn sie dieses Plugin auch installiert haben.
      </FormText>

      <FormInput
        title="User ID"
        value={userId}
        onChange={setUserId}
        placeholder="Discord User ID"
      />

      <FormInput
        title="Badge Text"
        value={label}
        onChange={setLabel}
        placeholder="z.B. Owner"
      />

      <FormInput
        title="Bild URL"
        value={uri}
        onChange={setUri}
        placeholder="https://..."
      />

      <TouchableOpacity
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
      </TouchableOpacity>

      <FormDivider />

      {badges.length === 0 ? (
        <FormText>Noch keine Badges gespeichert.</FormText>
      ) : (
        badges.map((badge) => (
          <View key={badge.type}>
            <TouchableOpacity
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
            </TouchableOpacity>
            <FormDivider />
          </View>
        ))
      )}
    </FormSection>
  );
}
