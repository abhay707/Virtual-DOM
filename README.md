# 🧩 Mini Virtual DOM Framework

A lightweight, educational **React-like framework** built from scratch to understand how the **Virtual DOM**, **reconciliation**, **hooks**, and **effects** work internally.

This project is **not a React clone**, but a learning-focused implementation that mirrors core ideas behind modern UI frameworks.

---

## ✨ Features

- 🧱 Virtual DOM representation
- 🔁 Efficient DOM updates using diffing (reconciliation)
- 🎣 `useState` hook for state management
- ⚡ `useEffect` hook with dependency tracking & cleanup
- 🧠 Scheduler-based re-rendering
- 🌱 Clean separation of concerns (core, hooks, runtime)
- 📦 Simple public API (`createRoot`, `createElement`, hooks)

---

## 🗂️ Project Structure
Virtual-DOM/
├── core/
│   ├── createElement.js   # Creates Virtual DOM nodes
│   ├── render.js          # Converts VDOM → real DOM
│   └── diff.js            # Reconciliation algorithm
│
├── hooks/
│   ├── useState.js        # State hook
│   └── useEffect.js       # Effect hook
│
├── runtime/
│   ├── runtimeState.js    # Shared internal state
│   ├── scheduler.js       # Schedules renders & runs effects
│   └── createRoot.js      # Root renderer (entry point)
│
├── app.js                 # Example user app
├── main.js                # App bootstrap
├── index.js               # Public API
└── index.html             # HTML entry

---

## 🚀 Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/Virtual-DOM.git
cd Virtual-DOM
```

### 2️⃣ Open index.html
Use Live Server (recommended) or any local server that supports ES modules.

