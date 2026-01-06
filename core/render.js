export default function render(vnode) {

    if (vnode == null || vnode === false) {
        return document.createTextNode("");
    }

    if (typeof vnode === "string" || typeof vnode === "number") {
        return document.createTextNode(vnode);
    }

    const element = document.createElement(vnode.type);

    const props = vnode.props || {};
    const children = props.children || [];

    for (let prop in props) {
        if (prop !== "children") {
            element[prop] = props[prop];
        }
    }

    if (Array.isArray(children)) {
        children.forEach(child => {
            element.appendChild(render(child));
        });
    } else {
        element.appendChild(render(children));
    }
    return element;

}