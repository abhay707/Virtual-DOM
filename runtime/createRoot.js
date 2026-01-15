import { runtimeState } from "./runtimeState.js";
import render from "../core/render.js";
import diff from "../core/diff.js";
import { runEffects, setRender } from "./scheduler.js";

export default function createRoot(container) {
    let oldVDOM = null;
    let currentApp = null;
    let renderCount = 0;
    const debugSubscribers = [];
    let lastSnapshot = null;

    function notifyDebug(snapshot) {
        lastSnapshot = snapshot;
        debugSubscribers.forEach(fn => fn(snapshot));
    }

    function renderRoot() {

        runtimeState.hookIndex = 0;
        runtimeState.effectIndex = 0;
        runtimeState.currentComponentName = currentApp?.name || "Anonymous";

        const newVDOM = currentApp();

        const changes = [];

        if (oldVDOM == null) {
            container.appendChild(render(newVDOM));
        } else {
            diff(container, oldVDOM, newVDOM, 0, changes, "0");
        }

        const effectLogStart = runtimeState.effectLog.length;
        oldVDOM = newVDOM;
        runEffects();

        const effectLog = runtimeState.effectLog.slice(effectLogStart);

        renderCount++;

        const snapshot = {
            id: renderCount,
            vdom: newVDOM,
            hooks: runtimeState.hooks.slice(),
            effects: runtimeState.effects
                .map((e, index) =>
                    e
                        ? {
                            index,
                            deps: e.deps ? e.deps.slice() : null
                        }
                        : null
                )
                .filter(Boolean),
            changes,
            effectLog
        };

        notifyDebug(snapshot);

        runtimeState.currentComponentName = null;
    }

    setRender(() => {
        if (currentApp) renderRoot();
    });

    return {
        render(App) {
            currentApp = App;
            renderRoot();
        },
        subscribeDebug(listener) {
            if (typeof listener !== "function") {
                return () => {};
            }

            debugSubscribers.push(listener);

            if (lastSnapshot) {
                listener(lastSnapshot);
            }

            return () => {
                const index = debugSubscribers.indexOf(listener);
                if (index !== -1) {
                    debugSubscribers.splice(index, 1);
                }
            };
        }
    };
}
