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
  currentPage: number; // Added for pagination
  pageSize: number; // Added for pagination
};

export const SearchStore = signalStore(
  { providedIn: 'root' },
  withState<State>({
    results: [],
    selected: null,
    showFullResults: false,
    errorMessage: '',
    currentPage: 0,
    pageSize: 10,
  }),
  withMethods((store) => {
    const breweryService = inject(BreweryService);
    const historyService = inject(HistoryService);
    const toastr = inject(ToastrService);

    return {
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
