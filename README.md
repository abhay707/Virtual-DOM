# 🧩 Mini Virtual DOM Framework

A lightweight, educational **React-like framework** built from scratch to understand how the **Virtual DOM**, **reconciliation**, **hooks**, and **effects** work internally.

This project is **not a React clone**, but a learning-focused implementation that mirrors core ideas behind modern UI frameworks.

---

## ✨ Features

* **Virtual DOM representation**: Lightweight JavaScript objects describing the UI.
* **Efficient Reconciliation**: A diffing algorithm that identifies changes and updates only the necessary parts of the real DOM.
* **`useState` Hook**: Functional state management with automated re-rendering.
* **`useEffect` Hook**: Side-effect management with dependency tracking and cleanup support.
* **Batching & Scheduler**: A centralized scheduler to prevent redundant renders during state updates.
* **Clean Architecture**: Strict separation between the core engine, hooks, and the runtime environment.

---

## 🏗️ How It Works

To understand how this framework functions, it's helpful to visualize the flow from a component update to a browser paint:



1.  **Render Phase**: When state changes, the framework calls the component function to generate a new **Virtual DOM** tree.
2.  **Reconciliation (Diffing)**: The `diff.js` engine compares the new tree with the previous one. It generates a "patch" of changes (e.g., *Update text*, *Change attribute*, *Replace node*).
3.  **Commit Phase**: The `render.js` engine applies those specific patches to the real browser DOM.
4.  **Effect Phase**: After the DOM is updated, `useEffect` callbacks are triggered based on their dependency arrays.

---

## 🗂️ Project Structure

```text
Virtual-DOM/
├── core/
│   ├── createElement.js   # Creates Virtual DOM nodes (h-functions)
│   ├── render.js          # Converts VDOM → real DOM (Initial mount)
│   └── diff.js            # The "brain": compares trees and updates nodes
│
├── hooks/
│   ├── useState.js        # State hook with closure-based persistence
│   └── useEffect.js       # Effect hook with cleanup & dependency logic
│
├── runtime/
│   ├── runtimeState.js    # Shared internal state (hook indexes, roots)
│   ├── scheduler.js       # Manages the update loop and effect queue
│   └── createRoot.js      # Root renderer and entry point
│
├── app.js                 # Demo application showing hooks in action
├── main.js                # Application bootstrapper
├── index.js               # Public API (Exporting the framework)
└── index.html             # HTML entry point

```
