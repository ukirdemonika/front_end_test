import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Search } from './search';
import { SearchStore } from '../../store/search.store';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SearchHistoryComponent } from './search-history/search-history';
import { BreweryDetail } from './brewery-detail/brewery-detail';
import { CommonModule, DatePipe } from '@angular/common';
import { signal } from '@angular/core';
import { Brewery } from '../../core/models/brewery.model';

describe('Search Component', () => {
  let component: Search;
  let fixture: ComponentFixture<Search>;

  let mockResultsSignal: ReturnType<typeof signal>;
  let mockShowFullSignal: ReturnType<typeof signal>;
  let mockSelectedSignal: ReturnType<typeof signal>;

  let storeSpy: {
    results: ReturnType<typeof signal>;
    showFullResults: ReturnType<typeof signal>;
    selected: ReturnType<typeof signal>;
    search: jasmine.Spy;
    getHistory: jasmine.Spy;
    selectBrewery?: jasmine.Spy;
    toggleShowFullResults?: jasmine.Spy;
    closeDetail?: jasmine.Spy;
    selectFromHistory?: jasmine.Spy;
    deleteHistory?: jasmine.Spy;
  };

  beforeEach(async () => {
    mockResultsSignal = signal<Brewery[]>([]);
    mockShowFullSignal = signal<boolean>(false);
    mockSelectedSignal = signal<Brewery | null>(null);

    storeSpy = {
      results: mockResultsSignal,
      showFullResults: mockShowFullSignal,
      selected: mockSelectedSignal,
      search: jasmine.createSpy('search'),
      getHistory: jasmine.createSpy('getHistory').and.returnValue([
        { term: 'IPA', date: new Date() },
        { term: 'Stout', date: new Date() }
      ])
    };

    await TestBed.configureTestingModule({
      imports: [
        Search,
        ReactiveFormsModule,
        FontAwesomeModule,
        SearchHistoryComponent,
        BreweryDetail,
        CommonModule
      ],
      providers: [
        { provide: SearchStore, useValue: storeSpy },
        DatePipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Search);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize searchControl with empty string', () => {
    expect(component.searchControl.value).toBe('');
  });

  it('should call store.search on input change', fakeAsync(() => {
    component.searchControl.setValue('test');
    tick(400);
    expect(storeSpy.search).toHaveBeenCalledWith('test');
  }));

  it('displayResults filters based on searchControl value', () => {
    mockResultsSignal.set([
      { id: 'b1', name: 'Brewery One', brewery_type: 'micro', city: 'City A', street: '123 Main St', phone: '1234567890' },
      { id: 'b2', name: 'Brewery Two', brewery_type: 'brewpub', city: 'City B', street: '456 Elm St', phone: '0987654321' },
      { id: 'b3', name: 'Another Brewery', brewery_type: 'micro', city: 'City C', street: '789 Oak St', phone: '1122334455' }
    ]);

    component.searchControl.setValue('brewery');
    const results = component.displayResults();
    expect(results.length).toBe(3);
  });

  it('displayResults respects showFullResults flag', () => {
    mockResultsSignal.set([
      { id: 'b1', name: 'Brewery One', brewery_type: 'micro', city: 'City A', street: '123 Main St', phone: '1234567890' },
      { id: 'b2', name: 'Brewery Two', brewery_type: 'brewpub', city: 'City B', street: '456 Elm St', phone: '0987654321' },
      { id: 'b3', name: 'Brewery Three', brewery_type: 'micro', city: 'City C', street: '789 Oak St', phone: '1122334455' },
      { id: 'b4', name: 'Brewery Four', brewery_type: 'micro', city: 'City D', street: '101 Pine St', phone: '6677889900' },
      { id: 'b5', name: 'Brewery Five', brewery_type: 'brewpub', city: 'City E', street: '202 Maple St', phone: '5566778899' },
      { id: 'b6', name: 'Brewery Six', brewery_type: 'micro', city: 'City F', street: '303 Oak St', phone: '4455667788' }
    ]);

    mockShowFullSignal.set(true);
    component.searchControl.setValue('brewery');
    const results = component.displayResults();
    expect(results.length).toBe(6);
  });
});