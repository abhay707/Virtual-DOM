import render from "./render.js";

function keyMap(children) {
    const map = {};
    children.forEach((child, index) => {
        const key = child?.props?.key;
        if (key != null) {
            map[key] = { child, index };
        }
    });
    return map;
}

function summarizeVNode(node) {
    if (node == null || node === false) {
        return { kind: "empty" };
    }

    if (typeof node === "string" || typeof node === "number") {
        return { kind: "text", value: String(node) };
    }

    return {
        kind: "element",
        type: node.type,
        key: node?.props?.key ?? null
    };
}

export default function diff(parent, oldNode, newNode, index = 0, changes = null, path = "0") {
    const existingDOM = parent.childNodes[index];

    if (!oldNode && newNode) {
        const newDOM = render(newNode);
        const refNode = parent.childNodes[index] || null;
        parent.insertBefore(newDOM, refNode);
        if (changes) {
            changes.push({
                type: "add",
                path,
                node: summarizeVNode(newNode)
            });
        }
        return;
    }

    if (oldNode && !newNode) {
        parent.removeChild(existingDOM);
        if (changes) {
            changes.push({
                type: "remove",
                path,
                node: summarizeVNode(oldNode)
            });
        }
        return;
    }

    if (
        typeof oldNode !== typeof newNode ||
        (typeof oldNode === "object" && oldNode.type !== newNode.type)
    ) {
        parent.replaceChild(render(newNode), existingDOM);
        if (changes) {
            changes.push({
                type: "replace",
                path,
                from: summarizeVNode(oldNode),
                to: summarizeVNode(newNode)
            });
        }
        return;
    }

    if (typeof newNode === "string" || typeof newNode === "number") {
        if (newNode !== oldNode) {
            existingDOM.textContent = newNode;
            if (changes) {
                changes.push({
                    type: "text",
                    path,
                    from: String(oldNode),
                    to: String(newNode)
                });
            }
        }
        return;
    }

    const oldChildren = Array.isArray(oldNode.props?.children)
        ? oldNode.props.children
        : [oldNode.props?.children].filter(Boolean);

    const newChildren = Array.isArray(newNode.props?.children)
        ? newNode.props.children
        : [newNode.props?.children].filter(Boolean);

    const oldKeyed = keyMap(oldChildren);
    let lastIndex = 0;

    newChildren.forEach((newChild, newIndex) => {
        const key = newChild?.props?.key;

        if (key != null && oldKeyed[key]) {
            const { child: oldChild, index: oldIndex } = oldKeyed[key];

            diff(existingDOM, oldChild, newChild, oldIndex, changes, path + "." + newIndex);

            if (oldIndex < lastIndex) {
                const domNode = existingDOM.childNodes[oldIndex];
                existingDOM.appendChild(domNode);
                if (changes) {
                    changes.push({
                        type: "move",
                        path: path + "." + newIndex,
                        fromIndex: oldIndex,
                        toIndex: existingDOM.childNodes.length - 1
                    });
                }
            }

            lastIndex = Math.max(oldIndex, lastIndex);
            oldKeyed[key] = null;
        } else {

            diff(existingDOM, oldChildren[newIndex], newChild, newIndex, changes, path + "." + newIndex);
        }
    });

    Object.keys(oldKeyed).forEach(key => {
        const entry = oldKeyed[key];
        if (entry) {
            const { index: childIndex, child } = entry;
            existingDOM.removeChild(existingDOM.childNodes[childIndex]);
            if (changes) {
                changes.push({
                    type: "remove",
                    path: path + "." + childIndex,
                    node: summarizeVNode(child)
                });
            }
        }
    });
}
