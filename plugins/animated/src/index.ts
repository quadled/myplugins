import { findByProps } from "@vendetta/metro";
import { instead } from "@vendetta/patcher";

let patches = [];

export default {
    onLoad: () => {
        globalThis.__probeUrls = [];
        const mod = findByProps("getUserAvatarURL");

        for (const key of ["getUserAvatarURL", "getGuildIconURL", "getGuildMemberAvatarURL"]) {
            if (typeof mod[key] !== "function") continue;
            patches.push(
                instead(key, mod, (args, orig) => {
                    const before = orig(...args);
                    if (typeof args[1] === "boolean") args[1] = true;
                    const after = orig(...args);
                    if (globalThis.__probeUrls.length < 10 && before !== after) {
                        globalThis.__probeUrls.push(`${key}\nVORHER: ${before}\nNACHHER: ${after}`);
                    }
                    return after;
                })
            );
        }
    },
    onUnload: () => { patches.forEach(u => u()); patches = []; }
};