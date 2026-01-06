import { createRoot } from "./index.js";
import App from "./app.js";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(App);