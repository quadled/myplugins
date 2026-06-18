import { React, ReactNative } from "@vendetta/metro/common";
import { Forms } from "@vendetta/ui/components";
import { addBadge, getBadges, removeBadge } from "./storage";

const { FormSection, FormText, FormRow, FormInput, FormDivider } = Forms;
const { View, Text, TouchableOpacity } = ReactNative;

export default function Settings() {
  const [userId, setUserId] = React.useState("");
  const [label, setLabel] = React.useState("");
  const [refresh, setRefresh] = React.useState(0);

  const badges = getBadges();

  return (
    <FormSection title="Custom Badges">
      <FormText>
        Eigene Badges sind nur lokal bei dir sichtbar.
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

      <TouchableOpacity
        onPress={() => {
          const cleanUserId = userId.trim();
          const cleanLabel = label.trim();
          if (!cleanUserId || !cleanLabel) return;

          addBadge(cleanUserId, cleanLabel);
          setUserId("");
          setLabel("");
          setRefresh(refresh + 1);
        }}
      >
        <FormRow label="Badge speichern" />
      </TouchableOpacity>

      <FormDivider />

      {badges.length === 0 ? (
        <FormText>Noch keine Badges gespeichert.</FormText>
      ) : (
        badges.map((badge) => (
          <View key={badge.userId}>
            <TouchableOpacity
              onPress={() => {
                removeBadge(badge.userId);
                setRefresh(refresh + 1);
              }}
            >
              <FormRow
                label={badge.label}
                subLabel={badge.userId}
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
