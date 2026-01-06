import { createElement, useState, useEffect } from "./index.js";

export default function App() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        document.title = `Count: ${count}`;

        const id = setInterval(() => {
            console.log("tick");
        }, 1000);

        return () => clearInterval(id);
    }, [count]);

    return createElement(
        "div",
        { className: "app" },
        createElement("h1", null, `Count: ${count}`),
        createElement(
            "button",
            { onclick: () => setCount(c => c+1) },
            "Increment"
        )
    );
}