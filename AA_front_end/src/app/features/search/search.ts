/* ===========================================================================
This file defines the main search page UI, including the search input, dropdown results, and conditional display of search history or brewery details. It uses Angular's reactive forms and signals for state management. 
The search input is debounced to optimize API calls, and the dropdown filters results based on the current input. 
When a brewery is selected, its details are shown, and if no brewery is selected, the search history is displayed instead.
============================================================================= */
import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreweryDetail } from './brewery-detail/brewery-detail';
import { SearchHistoryComponent } from './search-history/search-history';
import { SearchStore } from '../../store/search.store';
import type { Brewery } from '../../core/models/brewery.model';

@Component({
  selector: 'app-search',
  imports: [
    FontAwesomeModule,
    CommonModule,
    ReactiveFormsModule,
    SearchHistoryComponent,
    BreweryDetail,
  ],
  providers: [DatePipe],
  templateUrl: './search.html',
  styleUrls: ['./search.scss'],
})
export class Search {
  faSearch = faSearch;
  faXmark = faXmark;
  private sanitizer = inject(DomSanitizer);

  logoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('assets/images/aa-test-logo.svg');
  searchControl = new FormControl<string>('', { nonNullable: true });

  // Computed signal to filter and limit results based on the current search term and showFullResults flag
  displayResults = computed(() => {
    const query = this.searchControl.value.toLowerCase().trim();
    const allResults = this.store.results();
    const filtered = allResults.filter((b) => b.name.toLowerCase().includes(query))
    return this.store.showFullResults() ? filtered : filtered.slice(0, 5);
  });

  store = inject(SearchStore);

  // Constructor sets up a subscription to the search input changes, applying debounce and distinctUntilChanged to optimize API calls
  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(400),
       distinctUntilChanged(),
       takeUntilDestroyed())
      .subscribe((searchTerm) => {
        this.store.search(searchTerm); 
      });
  }

}
