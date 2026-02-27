import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';

import { SearchStore } from './search.store';
import { BreweryService } from '../core/services/brewery.service';
import { HistoryService } from '../core/services/history.service';
import { Brewery, SearchHistory } from '../core/models/brewery.model';

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
    this.items = this.items.filter(
      (x) => !(x.id === id && x.displayTimestamp === timestamp)
    );
  }

  history() {
    return this.items;
  }
}

describe('SearchStore', () => {
  let store: InstanceType<typeof SearchStore>;
  let breweryService: MockBreweryService;
  let historyService: MockHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SearchStore,
        { provide: BreweryService, useClass: MockBreweryService },
        { provide: HistoryService, useClass: MockHistoryService },
      ],
    });

    store = TestBed.inject(SearchStore);
    breweryService = TestBed.inject(BreweryService) as unknown as MockBreweryService;
    historyService = TestBed.inject(HistoryService) as unknown as MockHistoryService;
  });

  /* ---------------- STATE ---------------- */

  it('should initialize default state', () => {
    expect(store.results()).toEqual([]);
    expect(store.selected()).toBeNull();
    expect(store.showFullResults()).toBeFalse();
  });

  /* ---------------- SEARCH ---------------- */

  it('should clear results if term too short', () => {
    store.search('ab');
    expect(store.results()).toEqual([]);
    expect(breweryService.search).not.toHaveBeenCalled();
  });

  it('should search and populate results', fakeAsync(() => {
    store.search('beer');
    tick();

    expect(breweryService.search).toHaveBeenCalledWith('beer');
    expect(store.results()).toEqual(mockBreweries);
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

  /* ---------------- GET HISTORY ---------------- */

  it('should return history', () => {
    const item: SearchHistory = {
      ...mockBreweries[0],
      displayTimestamp: new Date().toISOString(),
    };

    historyService.save(item);

    expect(store.getHistory().length).toBe(1);
  });
});