/* ===========================================================================
This file defines the SearchStore, which manages the state and logic for the search feature of the application. 
It uses Angular's dependency injection to access the BreweryService for fetching search results and the HistoryService for managing search history.
The store includes methods for performing searches, selecting breweries, handling search history, and toggling the display of results.
============================================================================= */
import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

import { Brewery, SearchHistory } from '../core/models/brewery.model';
import { BreweryService } from '../core/services/brewery.service';
import { HistoryService } from '../core/services/history.service';

type State = {
  results: Brewery[];
  selected: Brewery | null;
  showFullResults: boolean;
};

export const SearchStore = signalStore(
  { providedIn: 'root' },

  // Initial state of the store
  withState<State>({
    results: [],
    selected: null,
    showFullResults: false,
  }),

  // Methods that define the logic for searching, selecting breweries, managing history, and toggling results display
  withMethods((store) => {
    const breweryService = inject(BreweryService);
    const historyService = inject(HistoryService);

    return {
      // Search method that takes a search term, validates it, and fetches results from the BreweryService.
      search(term: string) {
        if (!term || term.trim().length < 3) {
          patchState(store, { results: [] });
          return;
        }

        breweryService.search(term).subscribe((data) => {
          patchState(store, {
            results: data,
            showFullResults: false,
          });
        });
      },
      // Method to handle selection of a brewery from the search results, which also saves the selection to history and updates the state to show details.
      selectBrewery(brewery: Brewery) {
        const entry: SearchHistory = {
          ...brewery,
          displayTimestamp: new Date().toISOString(),
        };

        historyService.save(entry);

        patchState(store, {
          selected: brewery,
          results: [],
        });
      },
      
      // Method to handle selection of a brewery from the search history, which updates the state to show details without making a new API call.
      selectFromHistory(item: SearchHistory) {
        patchState(store, {
          selected: item,
          results: [],
        });
      },

      closeDetail() {
        patchState(store, {
          selected: null,
          results: [],
        });
      },

      deleteHistory(data: { id: string; timestamp: string }) {
        historyService.delete(data.id, data.timestamp);
      },

      toggleShowFullResults() {
        patchState(store, { showFullResults: true });
      },
      getHistory() {
        return historyService.history();
      },
    };
  }),
);
