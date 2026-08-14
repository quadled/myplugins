import { findByProps } from "@vendetta/metro";
import { before } from "@vendetta/patcher";

let patches = [];

export default {
    onLoad: () => {
        const mod = findByProps("getUserAvatarURL");
        const targets = ["getUserAvatarURL", "getGuildIconURL", "getUserBannerURL", "getGuildMemberAvatarURL"];

        globalThis.__probeLog = [];

        for (const key of targets) {
            if (typeof mod[key] !== "function") continue;
            patches.push(
                before(key, mod, (args) => {
                    globalThis.__probeLog.push(`${key}(${JSON.stringify(args)})`);
                    if (globalThis.__probeLog.length > 30) globalThis.__probeLog.shift();
                })
            );
        }
    },
    onUnload: () => {
        patches.forEach(u => u());
        patches = [];
    }
};