import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { SearchStore } from './search.store';
import { BreweryService } from '../core/services/brewery.service';
import { HistoryService } from '../core/services/history.service';
import { Brewery, SearchHistory } from '../core/models/brewery.model';
import { ToastrService } from 'ngx-toastr';

/* ---------------- MOCK DATA ---------------- */

const mockBreweries: Brewery[] = [
  {
    id: '1',
    name: 'Brewery A',
    brewery_type: 'micro',
    street: '123 Main St',
    city: 'City A',
    phone: '111111',
  },
  {
    id: '2',
    name: 'Brewery B',
    brewery_type: 'regional',
    street: '456 Market St',
    city: 'City B',
    phone: '222222',
  },
];

/* ---------------- MOCK SERVICES ---------------- */

class MockBreweryService {
  search = jasmine.createSpy().and.returnValue(of(mockBreweries));
}

class MockHistoryService {
  private items: SearchHistory[] = [];

  save(entry: SearchHistory) {
    this.items.push(entry);
  }

  delete(id: string, timestamp: string) {
    this.items = this.items.filter((x) => !(x.id === id && x.displayTimestamp === timestamp));
  }

  history() {
    return this.items;
  }
}

class MockToastrService {
  success = jasmine.createSpy();
  error = jasmine.createSpy();
  warning = jasmine.createSpy();
  info = jasmine.createSpy();
}

/**
 * Search Store Tests
 * Tests state management for search operations, results, and history
 * Uses @ngrx/signals for reactive state management
 */
describe('SearchStore', () => {
  let store: InstanceType<typeof SearchStore>;
  let breweryService: MockBreweryService;
  let historyService: MockHistoryService;
  let toastrService: MockToastrService;

  // Configure store with mock services
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SearchStore,
        { provide: BreweryService, useClass: MockBreweryService },
        { provide: HistoryService, useClass: MockHistoryService },
        { provide: ToastrService, useClass: MockToastrService },
      ],
    });

    store = TestBed.inject(SearchStore);
    breweryService = TestBed.inject(BreweryService) as unknown as MockBreweryService;
    historyService = TestBed.inject(HistoryService) as unknown as MockHistoryService;
    toastrService = TestBed.inject(ToastrService) as unknown as MockToastrService;
  });

  /* ---------------- STATE ---------------- */

  // State Initialization Tests
  it('should initialize default state', () => {
    expect(store.results()).toEqual([]);
    expect(store.selected()).toBeNull();
    expect(store.showFullResults()).toBeFalse();
  });

  it('should clear results and show warning for empty search term', () => {
    store.search('');
    expect(store.results()).toEqual([]);
    expect(breweryService.search).not.toHaveBeenCalled();
    expect(toastrService.warning).toHaveBeenCalledWith(
      'Please enter a search term.',
      'Empty Input',
    );
  });

  /* ---------------- SEARCH ---------------- */

  it('should clear results if term too short', () => {
    store.search('ab');
    expect(store.results()).toEqual([]);
    expect(breweryService.search).not.toHaveBeenCalled();
    expect(toastrService.warning).toHaveBeenCalledWith(
      'Search term must be at least 3 characters long.',
      'Validation Error',
    );
  });

  it('should search and populate results', fakeAsync(() => {
    store.search('beer');
    tick();

    expect(breweryService.search).toHaveBeenCalledWith('beer');
    expect(store.results()).toEqual(mockBreweries);
  }));

  it('should handle API error and return empty results', fakeAsync(() => {
    const errorSpy = jasmine
      .createSpy('search')
      .and.returnValue(throwError(() => new Error('API Error')));
    (breweryService as any).search = errorSpy;

    store.search('error');
    tick();

    expect(errorSpy).toHaveBeenCalledWith('error');
    expect(store.results()).toEqual([]);
    expect(store.errorMessage()).toBe('Unable to fetch search results. Please try again later.');
  }));

  it('should set showFullResults to false when search returns data', fakeAsync(() => {
    store.toggleShowFullResults();
    expect(store.showFullResults()).toBeTrue();

    store.search('beer');
    tick();

    expect(store.showFullResults()).toBeFalse();
  }));

  it('should handle API returning empty array', fakeAsync(() => {
    const emptySpy = jasmine.createSpy('search').and.returnValue(of([]));
    (breweryService as any).search = emptySpy;

    store.search('nothing');
    tick();

    expect(store.results()).toEqual([]);
  }));

  it('should display info toast when search returns no results', fakeAsync(() => {
    const emptySpy = jasmine.createSpy('search').and.returnValue(of([]));
    (breweryService as any).search = emptySpy;

    store.search('xyz');
    tick();

    expect(store.results()).toEqual([]);
    expect(toastrService.info).toHaveBeenCalledWith('No results found for: xyz', 'No Results');
  }));

  /* ---------------- SELECT BREWERY ---------------- */

  it('should select brewery and save history', () => {
    const brewery = mockBreweries[0];

    store.selectBrewery(brewery);

    expect(store.selected()).toEqual(brewery);
    expect(store.results()).toEqual([]);
    expect(historyService.history().length).toBe(1);
  });

  /* ---------------- SELECT FROM HISTORY ---------------- */

  it('should select from history without API call', () => {
    const historyItem: SearchHistory = {
      ...mockBreweries[1],
      displayTimestamp: new Date().toISOString(),
    };

    store.selectFromHistory(historyItem);

    expect(store.selected()).toEqual(historyItem);
    expect(store.results()).toEqual([]);
  });

  /* ---------------- CLOSE DETAIL ---------------- */

  it('should close detail', () => {
    store.closeDetail();
    expect(store.selected()).toBeNull();
  });

  /* ---------------- DELETE HISTORY ---------------- */

  it('should delete history item', () => {
    const item: SearchHistory = {
      ...mockBreweries[0],
      displayTimestamp: new Date().toISOString(),
    };

    historyService.save(item);

    store.deleteHistory({ id: item.id, timestamp: item.displayTimestamp });

    expect(historyService.history().length).toBe(0);
  });

  /* ---------------- TOGGLE ---------------- */

  it('should toggle showFullResults', () => {
    store.toggleShowFullResults();
    expect(store.showFullResults()).toBeTrue();
  });

  it('should toggle showLess', () => {
    store.toggleShowFullResults();
    expect(store.showFullResults()).toBeTrue();

    store.toggleShowLess();
    expect(store.showFullResults()).toBeFalse();
  });

  it('should handle whitespace-only search term', () => {
    store.search('   ');
    expect(store.results()).toEqual([]);
    expect(breweryService.search).not.toHaveBeenCalled();
  });

  /* ---------------- GET HISTORY ---------------- */

  it('should get history with multiple items', () => {
    const item1: SearchHistory = {
      ...mockBreweries[0],
      displayTimestamp: new Date().toISOString(),
    };
    const item2: SearchHistory = {
      ...mockBreweries[1],
      displayTimestamp: new Date().toISOString(),
    };

    historyService.save(item1);
    historyService.save(item2);

    expect(store.getHistory().length).toBe(2);
  });

  it('should maintain selected brewery state', () => {
    const brewery = mockBreweries[0];

    store.selectBrewery(brewery);
    expect(store.selected()).toEqual(brewery);

    store.closeDetail();
    expect(store.selected()).toBeNull();
  });

  it('should delete multiple history items', () => {
    const item1: SearchHistory = {
      ...mockBreweries[0],
      displayTimestamp: '2026-01-01',
    };
    const item2: SearchHistory = {
      ...mockBreweries[1],
      displayTimestamp: '2026-01-02',
    };

    historyService.save(item1);
    historyService.save(item2);
    expect(store.getHistory().length).toBe(2);

    store.deleteHistory({ id: item1.id, timestamp: item1.displayTimestamp });
    expect(store.getHistory().length).toBe(1);

    store.deleteHistory({ id: item2.id, timestamp: item2.displayTimestamp });
    expect(store.getHistory().length).toBe(0);
  });
});
