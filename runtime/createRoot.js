import { runtimeState } from "./runtimeState.js";
import render from "../core/render.js";
import diff from "../core/diff.js";
import { runEffects, setRender } from "./scheduler.js";

export default function createRoot(container) {
    let oldVDOM = null;
    let currentApp = null;

    function renderRoot() {

        runtimeState.hookIndex = 0;
        runtimeState.effectIndex = 0;

        const newVDOM = currentApp();

        if (oldVDOM == null) {
            container.appendChild(render(newVDOM));
        } else {
            diff(container, oldVDOM, newVDOM);
        }

        oldVDOM = newVDOM;
        runEffects();
    }

    setRender(() => {
        if (currentApp) renderRoot();
    });

    return {
        render(App) {
            currentApp = App;
            renderRoot();
        }
    };
}