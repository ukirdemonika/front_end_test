
## 🍺 Brewery Search — Angular (Signals + Signal Store)

### Overview

This project is a brewery search application built with **Angular (standalone components)** using **NgRx Signal Store** for state management.

The application allows users to:

* Search breweries via API
* View search suggestions (top 5 with expand option)
* Open brewery details
* Persist and view search history
* Re-open items from history (Optional)

---

## 🧠 State Management — Signal Store

The application uses **NgRx Signal Store** as the single source of truth for UI state.

Signal Store was chosen to:

* Leverage Angular Signals (modern reactive model)
* Reduce boilerplate compared to classic NgRx Store
* Keep business logic outside components
* Enable predictable state updates
* Improve scalability and testability

The store manages:

* Search results
* Selected brewery (detail view)
* Dropdown UI state (show full results)

Formatting (e.g. dates) is intentionally handled in components/templates to keep the store pure.

---

## 🏗️ Architecture

The application follows a **parent orchestrator pattern**:

* **Search (parent component)**
  Handles search input, dropdown, and communicates with the store.

* **BreweryDetail component**
  Presentational component responsible for the detail view.

* **SearchHistory component**
  Presentational component responsible for displaying search history.

* **SearchStore**
  Centralized state + business logic.

* **Services**

  * `BreweryService` → API communication
  * `HistoryService` → localStorage persistence

This separation keeps components focused on UI while the store manages state transitions.

---

## 🔄 Application Flows

### Flow 1 — Search

1. User types in the search field
2. Component calls `store.search(term)`
3. Store fetches breweries via API
4. Results stored in state
5. Dropdown displays top 5 results with option to expand

---

### Flow 2 — Detail View

1. User selects a brewery
2. `store.selectBrewery()` executes
3. History entry is saved
4. Selected brewery stored in state
5. Detail component renders

---

### Flow 3 — History View

1. When no brewery is selected
2. Search history is displayed
3. Selecting an item calls `store.selectFromHistory()`
4. Detail view opens again

---

## 💾 Search History Persistence

Search history is stored using **localStorage** via `HistoryService`.

Rules:

* Maximum 10 items
* No duplicates
* Latest searches first
* Reactive updates via Signals

---

## ⚡ Signals Usage

Signals are used to:

* Provide reactive UI updates
* Derive filtered dropdown results
* Eliminate manual subscriptions
* Simplify change detection

This results in a more predictable and lightweight reactive architecture.

---

## ✅ Key Design Decisions

* Signal Store instead of classic NgRx → less boilerplate
* Feature-level store → clearer scope
* Presentational child components → separation of concerns
* Store handles state, services handle IO, components handle UI
* Date formatting handled in template, not store

---

## 🚀 Tech Stack

* Angular (standalone components)
* Angular Signals
* NgRx Signal Store
* RxJS
* FontAwesome
* Open Brewery DB API

---

## 📌 Notes

This project demonstrates modern Angular patterns:

* Signals-first architecture
* Store-driven UI state
* Smart vs presentational component separation

Commands:
Steps:
1. Install Angular 21 and create new project 
   - npx @angular/cli@latest new AA_front_end --style=scss --ssr=false
2. Install fontawesome
   - npm install @fortawesome/angular-fontawesome @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons
3. npm install @ngrx/signals (signal store)
