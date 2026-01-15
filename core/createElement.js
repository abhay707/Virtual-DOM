import { runtimeState } from "../runtime/runtimeState.js";

export default function createElement(type, props, ...children) {
    const vnode = {
        type,
        props: {
            ...(props || {}),
            children
        }
    };

    if (runtimeState.currentComponentName) {
        vnode.__componentName = runtimeState.currentComponentName;
    }

    return vnode;
}
