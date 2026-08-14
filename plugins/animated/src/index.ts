import { findByProps, findByStoreName } from "@vendetta/metro";
import { instead, after } from "@vendetta/patcher";

let patches = [];

export default {
    onLoad: () => {
        // 1) Generisches canAnimate-Property (Avatare, Sticker, etc.)
        //    Betrifft Module, die ein Objekt mit "canAnimate" zurückgeben
        const animateModules = findByProps("canAnimate") 
            ? [findByProps("canAnimate")] 
            : [];

        for (const mod of animateModules) {
            if (typeof mod.canAnimate !== "function") continue;
            patches.push(
                instead("canAnimate", mod, () => true)
            );
        }

        // 2) Status Emoji Animation (CUSTOM_STATUS)
        const statusUtils = findByProps("getCustomStatusSection") 
            ?? findByProps("animateEmoji");
        if (statusUtils?.animateEmoji !== undefined) {
            patches.push(
                after("getCustomStatusSection", statusUtils, (_, res) => {
                    if (res?.animateEmoji !== undefined) res.animateEmoji = true;
                    return res;
                })
            );
        }

        // 3) Gradient Rollen (falls im Mobile-Client vorhanden)
        const gradientUtils = findByProps("animateGradient");
        if (gradientUtils) {
            patches.push(
                instead("animateGradient", gradientUtils, () => true)
            );
        }

        // 4) Nameplates
        const nameplateUtils = findByProps("MINI_PREVIEW");
        if (nameplateUtils) {
            patches.push(
                after("default", nameplateUtils, (_, res) => {
                    if (res?.props) {
                        res.props.animate = true;
                        res.props.loop = true;
                    }
                    return res;
                })
            );
        }
    },

    onUnload: () => {
        patches.forEach(unpatch => unpatch());
        patches = [];
    }
};