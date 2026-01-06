import { runtimeState } from "./runtimeState.js";

let scheduledRender = null;

export function setRender(fn) {
    scheduledRender = fn;
}

export function scheduleRender() {
    if (typeof scheduledRender === "function") {
        scheduledRender();
    }
}

export function runEffects() {
    runtimeState.effects.forEach(e => {
        if (!e) return;

        if (e.cleanup) {
            e.cleanup();
        }

        const cleanup = e.effect();
        e.cleanup = typeof cleanup === "function" ? cleanup : null;
    });
}