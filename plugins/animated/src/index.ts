import { findByProps } from "@vendetta/metro";
import { before } from "@vendetta/patcher";

let patches = [];

export default {
    onLoad: () => {
        const React = findByProps("createElement", "cloneElement");
        if (!React) return;

        patches.push(
            before("createElement", React, (args) => {
                const props = args[1];
                if (!props || typeof props !== "object") return;

                for (const key of Object.keys(props)) {
                    if (
                        (key === "animate" || key === "animated" || key === "canAnimate" || key === "isAnimating" || key === "animateGradient") &&
                        typeof props[key] === "boolean"
                    ) {
                        props[key] = true;
                    }
                }
            })
        );
    },
    onUnload: () => {
        patches.forEach(u => u());
        patches = [];
    }
};