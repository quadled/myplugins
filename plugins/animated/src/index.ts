import { findByProps } from "@vendetta/metro";
import { before } from "@vendetta/patcher";
import { logger } from "@vendetta";

let patches = [];

export default {
    onLoad: () => {
        const mod = findByProps("getUserAvatarURL");
        const targets = ["getUserAvatarURL", "getGuildIconURL", "getUserBannerURL", "getGuildMemberAvatarURL"];

        for (const key of targets) {
            if (typeof mod[key] !== "function") continue;
            patches.push(
                before(key, mod, (args) => {
                    logger.log(`[Probe] ${key} args:`, JSON.stringify(args, null, 2));
                })
            );
        }
    },
    onUnload: () => {
        patches.forEach(u => u());
        patches = [];
    }
};