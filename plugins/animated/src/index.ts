import { findByProps } from "@vendetta/metro";
import { before } from "@vendetta/patcher";
import { registerCommand } from "@vendetta/commands";
import { ApplicationCommandInputType, ApplicationCommandOptionType } from "@vendetta/commands/types";

let patches = [];
let unregisterCmd;
let captured = [];

export default {
    onLoad: () => {
        const mod = findByProps("getUserAvatarURL");
        const targets = ["getUserAvatarURL", "getGuildIconURL", "getUserBannerURL", "getGuildMemberAvatarURL"];

        for (const key of targets) {
            if (typeof mod[key] !== "function") continue;
            patches.push(
                before(key, mod, (args) => {
                    captured.push(`${key}(${JSON.stringify(args)})`);
                    if (captured.length > 30) captured.shift(); // nicht endlos wachsen lassen
                })
            );
        }

        unregisterCmd = registerCommand({
            name: "probelog",
            displayName: "probelog",
            description: "Zeigt gesammelte Avatar/Icon-URL Aufrufe",
            displayDescription: "Zeigt gesammelte Avatar/Icon-URL Aufrufe",
            inputType: ApplicationCommandInputType.BUILT_IN,
            type: 1,
            options: [],
            execute: (_, ctx) => {
                const output = captured.length
                    ? captured.join("\n")
                    : "Noch nichts aufgezeichnet. Öffne vorher ein Profil/Server-Icon.";
                return {
                    content: "```\n" + output.slice(0, 1800) + "\n```"
                };
            }
        });
    },
    onUnload: () => {
        patches.forEach(u => u());
        patches = [];
        unregisterCmd?.();
    }
};