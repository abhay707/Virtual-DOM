# Mini Virtual DOM + React Internals Visualizer

A lightweight, educational React-like framework built from scratch to understand how Virtual DOM, reconciliation, hooks, and effects work internally – plus a split-screen React Internals-style visualizer that shows what your mini-framework is doing on every render.

This project is not a production framework or a React clone. It is intentionally small and readable so you can explore how modern UI libraries think about rendering, diffing, and effects under the hood.

---

## Key Features

### Core framework

- Virtual DOM representation using plain JavaScript object trees
- `createElement` JSX-like element factory
- Initial mount via a simple `render(vnode)` function
- Diff-based reconciliation of old vs new VDOM (`diff(parent, oldNode, newNode)`)
- `useState` hook for functional state with automatic re-render
- `useEffect` hook with dependency arrays and cleanup support
- Simple scheduler that batches state updates through a central render function

<img width="1416" height="806" alt="Screenshot 2026-01-16 at 12 28 34 AM" src="https://github.com/user-attachments/assets/34a1e531-c4de-4d90-8199-ea861b3e2840" />


### React Internals-style visualizer

- Split-screen UI: app on the left, internal state on the right
- Component tree view, derived from tagged VDOM
- Live hooks panel showing the hooks array and which indices changed
- Effects panel showing active effects and their dependencies
- Effect lifecycle panel (run/cleanup) with timestamps
- DOM mutations panel driven by the diff algorithm
- Highlighting of changed VDOM nodes and changed hook values on every render

---

## High-Level Flow

On each state update, the system goes through these phases:

1. **Render phase**
   - The scheduler calls the current root component (`App`).
   - Hooks indices are reset (`hookIndex`, `effectIndex`).
   - The component returns a new Virtual DOM tree built via `createElement`.

2. **Diff / Reconciliation phase**
   - `diff(parent, oldVDOM, newVDOM, index, changes, path)` compares the previous VDOM with the new one.
   - It performs operations like add, remove, replace, text update, and move.
   - For each operation, it appends a structured mutation record into the `changes` array.

3. **Commit phase (real DOM update)**
   - `render.js` is used by `diff.js` when inserting or replacing nodes.
   - Only the parts that changed are updated in the actual DOM.

4. **Effect phase**
   - After committing DOM changes, `runEffects()` walks the registered effects.
   - For each effect:
     - The previous cleanup (if any) is invoked and logged.
     - The effect function is executed, and its returned cleanup (if any) is stored.
   - Each run/cleanup is logged with:
     - `type`: `run` or `cleanup`
     - `index`: effect index
     - `timestamp`: from `performance.now()`
     - `deps`: snapshot of the dependency array

5. **Debug snapshot emission**
   - `createRoot` builds a debug snapshot for each render:
     - `id`: render count
     - `vdom`: latest root VDOM
     - `hooks`: shallow copy of the hooks array
     - `effects`: summary of each effect (index and deps)
     - `changes`: DOM mutation records from the diff step
     - `effectLog`: lifecycle events from this render
   - Subscribers to `root.subscribeDebug(listener)` receive the snapshot and can visualize it.

---

## Project Structure

```text
Virtual-DOM/
├── core/
│   ├── createElement.js   // Creates Virtual DOM nodes and tags them with component names
│   ├── render.js          // Converts VDOM → real DOM (initial mount)
│   └── diff.js            // Reconciliation: compares trees and applies minimal DOM changes
│
├── hooks/
│   ├── useState.js        // State hook with index-based storage and rerender scheduling
│   └── useEffect.js       // Effect hook with dependency comparison and cleanup storage
│
├── runtime/
│   ├── runtimeState.js    // Global hook/effect indices, arrays, and debug state
│   ├── scheduler.js       // Schedules renders and runs logged effects
│   └── createRoot.js      // Root renderer, manages VDOM, effects, and debug snapshots
│
├── app.js                 // Demo application showcasing hooks/effects and diffing
├── main.js                // Browser entry: mounts App and wires the visualizer
├── visualizer.js          // DevTools-style panel: component tree, hooks, effects, mutations
├── index.js               // Public API (createElement, useState, useEffect, createRoot)
├── index.html             // HTML shell with split-screen layout
└── style.css              // Dark-mode styling for the app and visualizer
```

---

## Core Modules in Detail

### `core/createElement.js`

- Provides the `createElement(type, props, ...children)` function.
- Wraps element information into a VDOM node:
  - `type`: string tag name (for example `"div"`).
  - `props`: attributes, event handlers, and a `children` array.
- Reads `runtimeState.currentComponentName` and attaches `__componentName` to each VDOM node so the visualizer can reconstruct a component tree.

### `core/render.js`

- Handles the initial mount:
  - Converts the VDOM tree to actual DOM nodes recursively.
  - Called by `createRoot` on the first render.

### `core/diff.js`

- Compares `oldNode` and `newNode` VDOM trees.
- Decides when to:
  - Add or remove nodes
  - Replace nodes when type changes
  - Update text nodes
  - Reorder keyed children
- For each change, emits a mutation record into the `changes` array, including:
  - `type`: `add`, `remove`, `replace`, `text`, `move`
  - `path`: a stable string path like `"0.1.2"` into the tree
  - VDOM summaries (`from`, `to`, `node`) so the visualizer can render human-friendly descriptions.

### Hooks: `hooks/useState.js` and `hooks/useEffect.js`

- Hooks are stored in arrays managed by `runtimeState`.
- `hookIndex` and `effectIndex` advance as the component function runs.
- `useState(initial)`:
  - Reads the value from `runtimeState.hooks[hookIndex]` or initializes it.
  - Returns `[state, setState]`.
  - `setState` updates the stored value and calls `scheduleRender()`.
- `useEffect(effect, deps)`:
  - Compares the new `deps` to the previous ones.
  - If any dependency changed, stores `{ effect, deps, cleanup }` at the current `effectIndex`.
  - Effects are not run immediately; they are executed in the effect phase (`runEffects`).

### Runtime: `runtime/createRoot.js`, `runtime/scheduler.js`, `runtime/runtimeState.js`

- `createRoot(container)`:
  - Keeps track of `oldVDOM` and the current App function.
  - On each render:
    - Resets hook and effect indices.
    - Sets `runtimeState.currentComponentName` to the component name.
    - Calls the App to get `newVDOM`.
    - Runs `diff` or `render`.
    - Runs effects, captures lifecycle events, and builds a debug snapshot.
    - Notifies `subscribeDebug` listeners.
- `scheduler.js`:
  - Holds a single `scheduledRender` callback.
  - `scheduleRender()` invokes that callback.
  - `runEffects()` walks effects, dealing with cleanup and logging.
- `runtimeState.js`:
  - Stores runtime arrays and indices used across hooks and runtime.

---

## Visualizer (`visualizer.js`)

The visualizer subscribes to `root.subscribeDebug` and renders a live dashboard that mirrors what React DevTools offers at a tiny scale.

For each debug snapshot it renders:

- **Header row**
  - Render number (badge)
  - Count of recorded VDOM changes
- **Component tree**
  - Top-level node is the root component (for example `App`).
  - Below that, the full VDOM tree is displayed with props.
  - Nodes whose paths appear in `snapshot.changes` get a `changed` highlight.
- **Hooks panel**
  - Shows each entry in `snapshot.hooks` as `#index: value`.
  - Compares with the previous snapshot to highlight only changed indices.
- **Effects panel**
  - Lists each active effect with its index and dependency array.
- **Effect lifecycle panel**
  - Shows the `effectLog` from this render (run and cleanup events).
  - Displays relative timestamps like `@0.2ms` to illustrate ordering.
- **DOM mutations panel**
  - A flat list of mutation records from `diff.js`.
  - Makes it easy to see exactly which nodes were added, removed, replaced, or moved.

This makes it easy to click around the demo app and see how the hooks array, effects, and VDOM change on every interaction.

---

## Demo App (`app.js`)

The demo is intentionally designed to stress different aspects of the runtime and visualizer:

- Multiple `useState` hooks: `count`, `text`, `showList`.
- Three `useEffect` hooks:
  - One reacting to `count` changes.
  - One reacting to `text` changes.
  - One that runs only on mount and unmount.
- A toggleable list (`showList`) that drives add and remove DOM mutations.
- A list item whose text includes the current `count` to show text updates and keyed diffing.

Play with the three buttons and watch how all panels respond on the right-hand side.

---

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/Virtual-DOM.git
   cd Virtual-DOM
   ```

2. Start a simple static server (recommended, since ES modules are not always allowed from file URLs):

   ```bash
   # using node
   npx serve .

   # or using python
   python -m http.server 8000
   ```

3. Open the app:

   - Navigate to `http://localhost:3000/index.html` or `http://localhost:8000/index.html` depending on your server.
   - Interact with the buttons in the left-hand panel and observe the visualizer on the right.

There is no build step. Everything uses native ES modules and runs directly in the browser.

---

## Extending the Project

Some ideas if you want to go further:

- Add support for nested function components and render a deeper component tree.
- Implement additional hooks (for example a basic `useMemo` or `useRef`).
- Add time-travel debugging by storing previous snapshots and allowing scrubbing.
- Introduce priority levels or a more advanced scheduler.
- Experiment with different diff algorithms or heuristics.

---

## License

This project is open-source. See the `LICENSE` file for details.
