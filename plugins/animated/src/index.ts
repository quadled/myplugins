import { findByProps } from "@vendetta/metro";
import { instead } from "@vendetta/patcher";

let patches = [];

export default {
    onLoad: () => {
        const mod = findByProps("getUserAvatarURL");
        const targets = [
            "getUserAvatarURL",
            "getGuildIconURL",
            "getGuildMemberAvatarURL",
            "getUserBannerURL",
            "getGuildMemberBannerURL",
            "getAvatarDecorationURL"
        ];

        for (const key of targets) {
            if (typeof mod[key] !== "function") continue;
            patches.push(
                instead(key, mod, (args, orig) => {
                    if (typeof args[1] === "boolean") {
                        args[1] = true;
                    }
                    return orig(...args);
                })
            );
        }
    },
    onUnload: () => {
        patches.forEach(u => u());
        patches = [];
    }
};