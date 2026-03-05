/* ===========================================================================
This file defines the main search page UI, including the search input, dropdown results, and conditional display of search history or brewery details. It uses Angular's reactive forms and signals for state management. 
The search input is debounced to optimize API calls, and the dropdown filters results based on the current input. 
When a brewery is selected, its details are shown, and if no brewery is selected, the search history is displayed instead.
============================================================================= */
import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, signal, effect } from '@angular/core';
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
import { Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

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
  private toastr = inject(ToastrService);
  store = inject(SearchStore);

  logoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('assets/images/aa-test-logo.svg');
  searchControl = new FormControl<string>('', { nonNullable: true ,validators: [Validators.minLength(3)] });

  // Computed signal to filter and limit results based on the current search term and showFullResults flag
  displayResults = computed(() => {
    const query = this.searchControl.value.toLowerCase().trim();
    const allResults = this.store.results();
    const filtered = allResults.filter((b) => b.name.toLowerCase().includes(query))
    if (!this.store.showFullResults()) {
      return filtered.slice(0, 5);
    } else {
      // Pagination Slice (10 per page)
      const start = this.store.currentPage() * this.store.pageSize();
      const end = start + this.store.pageSize();
      return filtered.slice(start, end);
    }
  });

 // Helper for pagination UI
  totalResultsCount = computed(() => {
    const query = this.searchControl.value.toLowerCase().trim();
    return this.store.results().filter((b) => b.name.toLowerCase().includes(query)).length;
  });

  totalPages = computed(() => Math.ceil(this.totalResultsCount() / this.store.pageSize()));

  // Constructor sets up a subscription to the search input changes, applying debounce and distinctUntilChanged to optimize API calls
  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(400),
       distinctUntilChanged(),
       takeUntilDestroyed())
      .subscribe((searchTerm) => {
        this.store.search(searchTerm); 
      });

  
    // This effect runs whenever displayResults changes, showing a success message if results are found or an info message if no results match the search term
    effect(() => {
      const results = this.displayResults();
      const storeResults = this.store.results();
      const searchTerm = this.searchControl.value.trim();
      
      if (results.length > 0) {
        this.toastr.success('Found ' + results.length + ' result(s)', 'Success');
      } else if (results.length === 0 && storeResults.length > 0 && searchTerm.length > 2) {
        this.toastr.info('No matching results found', 'No Results');
      }
    });
  }

}
