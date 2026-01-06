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

export default function diff(parent, oldNode, newNode, index = 0) {
    const existingDOM = parent.childNodes[index];

    // Add new node
    if (!oldNode && newNode) {
        const newDOM = render(newNode);
        const refNode = parent.childNodes[index] || null;
        parent.insertBefore(newDOM, refNode);
        return;
    }

    // Remove node
    if (oldNode && !newNode) {
        parent.removeChild(existingDOM);
        return;
    }

    // Replace node (type changed)
    if (
        typeof oldNode !== typeof newNode ||
        (typeof oldNode === "object" && oldNode.type !== newNode.type)
    ) {
        parent.replaceChild(render(newNode), existingDOM);
        return;
    }

    // Update text
    if (typeof newNode === "string" || typeof newNode === "number") {
        if (newNode !== oldNode) {
            existingDOM.textContent = newNode;
        }
        return;
    }

    // Diff children
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

            diff(existingDOM, oldChild, newChild, oldIndex);

            if (oldIndex < lastIndex) {
                const domNode = existingDOM.childNodes[oldIndex];
                existingDOM.appendChild(domNode);
            }

            lastIndex = Math.max(oldIndex, lastIndex);
            oldKeyed[key] = null;
        } else {

            diff(existingDOM, oldChildren[newIndex], newChild, newIndex);
        }
    });

    Object.keys(oldKeyed).forEach(key => {
        const entry = oldKeyed[key];
        if (entry) {
            const { index } = entry;
            existingDOM.removeChild(existingDOM.childNodes[index]);
        }
    });
}