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
    runtimeState.effects.forEach((e, index) => {
        if (!e) return;

        if (e.cleanup) {
            e.cleanup();
            runtimeState.effectLog.push({
                type: "cleanup",
                index,
                timestamp: performance.now(),
                deps: e.deps ? e.deps.slice() : null
            });
        }

        const cleanup = e.effect();
        runtimeState.effectLog.push({
            type: "run",
            index,
            timestamp: performance.now(),
            deps: e.deps ? e.deps.slice() : null
        });
        e.cleanup = typeof cleanup === "function" ? cleanup : null;
    });
}
