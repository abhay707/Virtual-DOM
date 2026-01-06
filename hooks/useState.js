import { runtimeState } from "../runtime/runtimeState.js";
import { scheduleRender } from "../runtime/scheduler.js";

export default function useState(initialValue) {
    const currentIndex = runtimeState.hookIndex;

    runtimeState.hooks[currentIndex] = runtimeState.hooks[currentIndex] ?? initialValue;

    function setState(value) {
        runtimeState.hooks[currentIndex] =
            typeof value === "function"
                ? value(runtimeState.hooks[currentIndex])
                : value;
        scheduleRender();
    }

    runtimeState.hookIndex++;

    return [runtimeState.hooks[currentIndex], setState];
}
