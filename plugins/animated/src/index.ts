import { findByProps } from "@vendetta/metro";
import { before } from "@vendetta/patcher";

let patches = [];

export default {
    onLoad: () => {
        globalThis.__probeScroll = [];
        globalThis.__probeJsx = [];

        // A) Werden die URL-Funktionen beim reinen Scrollen aufgerufen?
        const iconMod = findByProps("getUserAvatarURL");
        for (const key of ["getUserAvatarURL", "getGuildIconURL", "getGuildMemberAvatarURL"]) {
            if (typeof iconMod[key] !== "function") continue;
            patches.push(before(key, iconMod, (args) => {
                if (globalThis.__probeScroll.length < 20) {
                    globalThis.__probeScroll.push(`${key}: animate=${args[1]} | args=${JSON.stringify(args.slice(0,5))}`);
                }
            }));
        }

        // B) jsx-runtime statt createElement, gefiltert auf Discord-CDN-Bilder
        const jsxMod = findByProps("jsxs") || findByProps("jsx");
        if (jsxMod) {
            for (const fn of ["jsx", "jsxs"]) {
                if (typeof jsxMod[fn] !== "function") continue;
                patches.push(before(fn, jsxMod, (args) => {
                    const props = args[1];
                    const src = props?.source?.uri || props?.uri || props?.src;
                    if (typeof src === "string" && src.includes("cdn.discordapp.com") && globalThis.__probeJsx.length < 15) {
                        globalThis.__probeJsx.push(`${fn}: keys=[${Object.keys(props).join(",")}] src=${src.slice(0,70)}`);
                    }
                }));
            }
        } else {
            globalThis.__probeJsx.push("jsx-runtime NICHT gefunden");
        }
    },
    onUnload: () => {
        patches.forEach(u => u());
        patches = [];
    }
};