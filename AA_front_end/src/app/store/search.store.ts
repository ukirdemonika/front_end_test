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
import { catchError, of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

type State = {
  results: Brewery[];
  selected: Brewery | null;
  showFullResults: boolean;
  errorMessage: string;
  currentPage: number;
  pageSize: number;
};

export const SearchStore = signalStore(
  { providedIn: 'root' },

  // Initial state of the store
  withState<State>({
    results: [],
    selected: null,
    showFullResults: false,
    errorMessage: '',
    currentPage: 0,
    pageSize: 10,
  }),

  // Methods that define the logic for searching, selecting breweries, managing history, and toggling results display
  withMethods((store) => {
    const breweryService = inject(BreweryService);
    const historyService = inject(HistoryService);
    const toastr = inject(ToastrService);

    return {
      // Search method that takes a search term, validates it, and fetches results from the BreweryService.
      search(term: string) {
        const trimmedTerm = term.trim();
        if (!trimmedTerm || trimmedTerm.length <= 2) {
          patchState(store, { results: [], currentPage: 0 });
          return;
        }

        breweryService
          .search(term)
          .pipe(
            catchError((err) => {
              toastr.error('Unable to fetch results.', 'Error');
              return of([]);
            }),
          )
          .subscribe((data) => {
            patchState(store, {
              results: data,
              showFullResults: false,
              currentPage: 0, // Reset page on new search
            });
          });
      },
      // Pagination Methods
      nextPage() {
        patchState(store, { currentPage: store.currentPage() + 1 });
      },
      prevPage() {
        if (store.currentPage() > 0) {
          patchState(store, { currentPage: store.currentPage() - 1 });
        }
      },

      // Method to handle selection of a brewery from the search results, which also saves the selection to history and updates the state to show details.
      selectBrewery(brewery: Brewery) {
        const entry: SearchHistory = { ...brewery, displayTimestamp: new Date().toISOString() };
        historyService.save(entry);
        patchState(store, {
          selected: brewery,
          results: [],
          showFullResults: false,
          currentPage: 0,
        });
      },

      // Method to handle selection of a brewery from the search history, which updates the state to show details without making a new API call.
      selectFromHistory(item: SearchHistory) {
        patchState(store, { selected: item, results: [], currentPage: 0 });
      },
      closeDetail() {
        patchState(store, { selected: null, results: [], currentPage: 0 });
      },
      deleteHistory(data: { id: string; timestamp: string }) {
        historyService.delete(data.id, data.timestamp);
      },
      toggleShowFullResults() {
        patchState(store, { showFullResults: true, currentPage: 0 });
      },
      toggleShowLess() {
        patchState(store, { showFullResults: false, currentPage: 0 });
      },
      getHistory() {
        return historyService.history();
      },
    };
  }),
);
