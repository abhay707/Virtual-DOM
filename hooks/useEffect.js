import { runtimeState } from "../runtime/runtimeState.js";

export default function useEffect(effect, deps) {
    const currentIndex = runtimeState.effectIndex;
    const old = runtimeState.effects[currentIndex];

    let hasChanged = true;

    if (old && deps) {
        hasChanged = deps.some(
            (dep, i) => !Object.is(dep, old.deps[i])
        );
    }

    if (hasChanged) {
        runtimeState.effects[currentIndex] = {
            effect,
            deps,
            cleanup: old?.cleanup
        };
    }

    runtimeState.effectIndex++;
}