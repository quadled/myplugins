import { React, ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { Forms } from "@vendetta/ui/components";
import { addClanTag, getClanTags, removeClanTag } from "./storage";

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

  const [clanUserId, setClanUserId] = React.useState("");
  const [clanLabel, setClanLabel] = React.useState("");
  const [clanUri, setClanUri] = React.useState("");
  const [refresh, setRefresh] = React.useState(0);

  const clanTags = getClanTags();

  return (
    <ScrollView>
      <FormSection title="Custom Clan Tags">
        <FormText>
          Erstelle ein lokales Clan-Tag mit eigenem Icon neben dem Namen. Andere sehen es nur, wenn sie das Plugin ebenfalls nutzen.
        </FormText>

        <TextInput
          style={inputStyle as any}
          value={clanUserId}
          onChangeText={setClanUserId}
          placeholder="Discord User ID"
          placeholderTextColor="#949ba4"
        />

        <TextInput
          style={inputStyle as any}
          value={clanLabel}
          onChangeText={setClanLabel}
          placeholder="Clan Name (z.B. Qrew)"
          placeholderTextColor="#949ba4"
        />

        <TextInput
          style={inputStyle as any}
          value={clanUri}
          onChangeText={setClanUri}
          placeholder="Icon URL (https://...)"
          placeholderTextColor="#949ba4"
          autoCapitalize="none"
        />

        <Pressable
          onPress={() => {
            const id = clanUserId.trim();
            const text = clanLabel.trim();
            const link = clanUri.trim();
            if (!id || !text || !link) return;
            if (!link.startsWith("https://") && !link.startsWith("http://")) return;

            addClanTag(id, text, link);
            setClanUserId("");
            setClanLabel("");
            setClanUri("");
            setRefresh(refresh + 1);
          }}
        >
          <FormRow label="Clan Tag hinzufuegen" />
        </Pressable>

        <FormDivider />

        {clanTags.length === 0 ? (
          <FormText>Noch keine Clan Tags gespeichert.</FormText>
        ) : (
          clanTags.map((clan) => (
            <View key={clan.userId}>
              <Pressable
                onPress={() => {
                  removeClanTag(clan.userId);
                  setRefresh(refresh + 1);
                }}
              >
                <FormRow
                  label={`[${clan.label}]`}
                  subLabel={`User: ${clan.userId}`}
                  leading={React.createElement(Image, {
                    source: { uri: clan.uri },
                    style: { width: 24, height: 24, borderRadius: 4 } as any,
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