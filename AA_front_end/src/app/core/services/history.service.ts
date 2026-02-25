/* ==========================================================================================================
This service is responsible for managing the search history in local storage.
It provides methods to save, load, and delete search history items.
====================================================== */

import { Injectable, signal } from '@angular/core';
import { SearchHistory } from '../models/brewery.model';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly KEY = 'aa_brewery_history';
  history = signal<SearchHistory[]>(this.load());

  // Load history from local storage or return an empty array if not found
  private load(): SearchHistory[] {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : [];
  }

  // Save a new search history item, ensuring no duplicates and keeping only the latest 10 entries
  save(item: SearchHistory) {
    const current = this.history();
    const filtered = current.filter((h) => h.id !== item.id);
    const updated = [item, ...filtered].slice(0, 10);
    this.history.set(updated);
    localStorage.setItem(this.KEY, JSON.stringify(updated));
  }

// Delete a specific history item based on its id and timestamp
  delete(id: string, timestamp: string) {
    const updated = this.history().filter(
      (h) => !(h.id === id && h.displayTimestamp === timestamp),
    );
    this.history.set(updated);
    localStorage.setItem(this.KEY, JSON.stringify(updated));
  }
}
