import { createElement, useState, useEffect } from "./index.js";

export default function App() {
    const [count, setCount] = useState(0);
    const [text, setText] = useState("Hello");
    const [showList, setShowList] = useState(true);

    // Effect 1: Logs when count changes
    useEffect(() => {
        console.log(`Count changed to ${count}`);
    }, [count]);

    // Effect 2: Logs when text changes
    useEffect(() => {
        console.log(`Text changed to ${text}`);
    }, [text]);

    // Effect 3: Run once on mount
    useEffect(() => {
        console.log("App mounted");
        return () => console.log("App unmounted");
    }, []);

    const items = showList
        ? [
              { id: 1, text: "Item 1" },
              { id: 2, text: "Item 2" },
              { id: 3, text: `Item 3 (Count: ${count})` }
          ]
        : [];

    return createElement(
        "div",
        { className: "app", style: "padding: 20px; font-family: sans-serif;" },
        createElement("h1", null, "Rich Debug Demo"),
        createElement(
            "div",
            { style: "margin-bottom: 20px; border: 1px solid #333; padding: 10px; border-radius: 4px;" },
            createElement("h3", null, "State"),
            createElement("div", null, `Count: ${count}`),
            createElement("div", null, `Text: ${text}`),
            createElement(
                "div",
                { style: "margin-top: 10px; display: flex; gap: 8px;" },
                createElement(
                    "button",
                    { onclick: () => setCount(c => c + 1) },
                    "Increment Count"
                ),
                createElement(
                    "button",
                    { onclick: () => setText(t => t + "!") },
                    "Append '!' to Text"
                ),
                createElement(
                    "button",
                    { onclick: () => setShowList(s => !s) },
                    showList ? "Hide List" : "Show List"
                )
            )
        ),
        showList && createElement(
            "div",
            { style: "border: 1px solid #333; padding: 10px; border-radius: 4px;" },
            createElement("h3", null, "List (Diffing Demo)"),
            createElement(
                "ul",
                null,
                ...items.map(item =>
                    createElement(
                        "li",
                        { key: item.id },
                        item.text
                    )
                )
            )
        )
    );
}
