
export function initVisualizer(root, debugContainer) {
    if (debugContainer && typeof root.subscribeDebug === "function") {
        let lastSnapshot = null;

        root.subscribeDebug(snapshot => {
            renderDebug(debugContainer, snapshot, lastSnapshot);
            lastSnapshot = snapshot;
        });
    }
}

function h(tag, props, ...children) {
    const el = document.createElement(tag);

    if (props) {
        Object.keys(props).forEach(key => {
            if (key === "className") {
                el.className = props[key];
            } else if (key === "style") {
                el.style.cssText = props[key];
            } else {
                el[key] = props[key];
            }
        });
    }

    children.flat().forEach(child => {
        if (child == null || child === false) return;
        if (typeof child === "string" || typeof child === "number") {
            el.appendChild(document.createTextNode(child));
        } else {
            el.appendChild(child);
        }
    });

    return el;
}

function renderDebug(container, snapshot, previous) {
    container.innerHTML = "";

    const changedPaths = new Set(
        (snapshot.changes || []).map(change => change.path)
    );

    const changedHookIndices = new Set();

    if (previous && previous.hooks && snapshot.hooks) {
        const length = Math.max(previous.hooks.length, snapshot.hooks.length);
        for (let i = 0; i < length; i++) {
            const before = previous.hooks[i];
            const after = snapshot.hooks[i];

            if (!Object.is(before, after)) {
                changedHookIndices.add(i);
            }
        }
    }

    const headerRow = h(
        "div",
        { style: "display:flex; gap:8px; align-items:center; margin-bottom:8px;" },
        h("span", { className: "badge hot" }, "render ", String(snapshot.id)),
        h(
            "span",
            { className: "badge cool" },
            snapshot.changes ? String(snapshot.changes.length) : "0",
            " changes"
        )
    );

    const componentSection = h(
        "section",
        { style: "margin-bottom:12px;" },
        h("div", { className: "badge cool" }, "component tree"),
        renderComponentTree(snapshot.vdom, changedPaths)
    );

    const hooksSection = h(
        "section",
        { style: "margin-bottom:12px;" },
        h("div", { className: "badge cool" }, "hooks"),
        renderHooks(snapshot.hooks, changedHookIndices)
    );

    const effectsSection = h(
        "section",
        {},
        h("div", { className: "badge cool" }, "effects"),
        renderEffects(snapshot.effects)
    );

    const effectLifecycleSection = h(
        "section",
        { style: "margin-top:8px;" },
        h("div", { className: "badge cool" }, "effect lifecycle"),
        renderEffectLifecycle(snapshot.effectLog)
    );

    const domMutationsSection = h(
        "section",
        { style: "margin-top:8px;" },
        h("div", { className: "badge cool" }, "dom mutations"),
        renderDomMutations(snapshot.changes)
    );

    container.appendChild(headerRow);
    container.appendChild(componentSection);
    container.appendChild(hooksSection);
    container.appendChild(effectsSection);
    container.appendChild(effectLifecycleSection);
    container.appendChild(domMutationsSection);
}

function renderComponentTree(rootVDOM, changedPaths) {
    const name =
        rootVDOM && rootVDOM.__componentName
            ? rootVDOM.__componentName
            : "App";

    const container = h("div", { className: "tree-node" });

    const header = h(
        "div",
        { className: "code" },
        h("span", { className: "tree-node-type" }, name)
    );

    container.appendChild(header);

    if (rootVDOM) {
        const body = h(
            "div",
            {
                style:
                    "margin-left:12px; border-left:1px dashed #1f2937; padding-left:8px; margin-top:4px;"
            },
            renderVDOMNode(rootVDOM, "0", changedPaths)
        );
        container.appendChild(body);
    }

    return container;
}

function renderVDOMNode(node, path, changedPaths) {
    if (node == null || node === false) {
        return h("div", { className: "tree-node" }, "null");
    }

    if (typeof node === "string" || typeof node === "number") {
        return h(
            "div",
            {
                className:
                    "tree-node code" + (changedPaths.has(path) ? " changed" : "")
            },
            JSON.stringify(node)
        );
    }

    const className =
        "tree-node" + (changedPaths.has(path) ? " changed" : "");

    const header = h(
        "div",
        { className: "code" },
        h("span", { className: "tree-node-type" }, "<", node.type, "> "),
        renderProps(node.props)
    );

    const container = h("div", { className });
    container.appendChild(header);

    const children = Array.isArray(node.props?.children)
        ? node.props.children
        : [node.props?.children].filter(Boolean);

    if (children.length) {
        const childrenContainer = h("div", {
            style:
                "margin-left:12px; border-left:1px dashed #1f2937; padding-left:8px; margin-top:4px;"
        });

        children.forEach((child, index) => {
            const childPath = path + "." + index;
            childrenContainer.appendChild(
                renderVDOMNode(child, childPath, changedPaths)
            );
        });

        container.appendChild(childrenContainer);
    }

    return container;
}

function renderProps(props) {
    const entries = Object.entries(props || {}).filter(
        ([key]) => key !== "children"
    );

    if (!entries.length) {
        return h("span", { className: "tree-node-props" }, "{}");
    }

    const parts = entries.map(([key, value]) => {
        if (typeof value === "function") {
            return key + "=fn()";
        }

        try {
            return key + "=" + JSON.stringify(value);
        } catch {
            return key + "=<?>"; 
        }
    });

    return h("span", { className: "tree-node-props" }, parts.join(" "));
}

function renderHooks(hooks, changedHookIndices) {
    const list = h("div", { className: "hooks-list" });

    if (!hooks || hooks.length === 0) {
        list.appendChild(h("div", {}, "no hooks"));
        return list;
    }

    hooks.forEach((value, index) => {
        const changed = changedHookIndices.has(index);
        const line = h(
            "div",
            {},
            h(
                "span",
                { className: "tree-node-key" },
                "#",
                String(index),
                ": "
            ),
            h(
                "span",
                { className: changed ? "highlight" : "" },
                formatValue(value)
            )
        );
        list.appendChild(line);
    });

    return list;
}

function renderEffects(effects) {
    const container = h("div", { className: "effects-list" });

    if (!effects || effects.length === 0) {
        container.appendChild(h("div", {}, "no effects"));
        return container;
    }

    effects.forEach(effect => {
        const line = h(
            "div",
            {},
            h("span", { className: "tree-node-key" }, "effect#", String(effect.index), " "),
            h("span", {}, "deps: ", formatValue(effect.deps))
        );
        container.appendChild(line);
    });

    return container;
}

function renderEffectLifecycle(effectLog) {
    const container = h("div", { className: "effects-list" });

    if (!effectLog || !effectLog.length) {
        container.appendChild(h("div", {}, "no lifecycle events"));
        return container;
    }

    const startTime = effectLog[0].timestamp;

    effectLog.forEach(entry => {
        const time =
            entry.timestamp != null && startTime != null
                ? (entry.timestamp - startTime).toFixed(1) + "ms"
                : "";

        const line = h(
            "div",
            {},
            "[",
            entry.type,
            "] effect#",
            String(entry.index),
            time ? " @" + time : "",
            entry.deps != null ? " deps: " + formatValue(entry.deps) : ""
        );
        container.appendChild(line);
    });

    return container;
}

function renderDomMutations(changes) {
    const container = h("div", { className: "effects-list" });

    if (!changes || !changes.length) {
        container.appendChild(h("div", {}, "no dom mutations"));
        return container;
    }

    changes.forEach(change => {
        const base = "[" + change.type + "] " + change.path;

        let detail = "";

        if (change.type === "add" || change.type === "remove") {
            const node = change.node || {};
            if (node.kind === "element") {
                detail = " <" + node.type + ">";
            } else if (node.kind === "text") {
                detail = " " + JSON.stringify(node.value);
            }
        } else if (change.type === "replace") {
            const from = change.from || {};
            const to = change.to || {};
            detail =
                " from " +
                (from.kind === "element"
                    ? "<" + from.type + ">"
                    : from.kind === "text"
                    ? JSON.stringify(from.value)
                    : "?") +
                " to " +
                (to.kind === "element"
                    ? "<" + to.type + ">"
                    : to.kind === "text"
                    ? JSON.stringify(to.value)
                    : "?");
        } else if (change.type === "text") {
            detail =
                " " +
                JSON.stringify(change.from) +
                " → " +
                JSON.stringify(change.to);
        } else if (change.type === "move") {
            detail =
                " from index " +
                String(change.fromIndex) +
                " to " +
                String(change.toIndex);
        }

        container.appendChild(h("div", {}, base, detail));
    });

    return container;
}

function formatValue(value) {
    if (typeof value === "function") {
        return "fn()";
    }

    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
}
