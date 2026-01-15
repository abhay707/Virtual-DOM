import { createRoot } from "./index.js";
import App from "./app.js";
import { initVisualizer } from "./visualizer.js";

const container = document.getElementById("root");
const root = createRoot(container);

const debugContainer = document.getElementById("debug-root");

root.render(App);

initVisualizer(root, debugContainer);
