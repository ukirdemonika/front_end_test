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
import { ToastrService } from 'ngx-toastr';

/**
 * Search Component Tests
 * Tests the search functionality including input, filtering, and results display
 */
describe('Search Component', () => {
  let component: Search;
  let fixture: ComponentFixture<Search>;

  // Mock signals for component state management
  let mockResultsSignal: ReturnType<typeof signal>;
  let mockShowFullSignal: ReturnType<typeof signal>;
  let mockSelectedSignal: ReturnType<typeof signal>;

  // Mock store for search operations
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

  // Setup test environment and mock signals
  beforeEach(async () => {
    // Initialize mock signals with default values
    mockResultsSignal = signal<Brewery[]>([]);
    mockShowFullSignal = signal<boolean>(false);
    mockSelectedSignal = signal<Brewery | null>(null);

    // Setup mock store with search functionality
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
        { provide: ToastrService, useValue: {
          success: jasmine.createSpy(),
          error: jasmine.createSpy(),
          warning: jasmine.createSpy(),
          info: jasmine.createSpy(),
        }},
        DatePipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Search);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Component Creation and Initialization Tests
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Search Control Behavior Tests
  it('should initialize searchControl with empty string', () => {
    expect(component.searchControl.value).toBe('');
  });

  it('should call store.search on input change', fakeAsync(() => {
    component.searchControl.setValue('test');
    tick(400);
    expect(storeSpy.search).toHaveBeenCalledWith('test');
  }));

  // Test displayResults method with various scenarios
  // Empty Results Cases
  it('displayResults returns empty array when results array is empty', () => {
    mockResultsSignal.set([]); // No search results from store
    component.searchControl.setValue('test');
    const results = component.displayResults();
    expect(results.length).toBe(0);
  });

  it('displayResults returns all results when all match filter with showFullResults true', () => {
    const testBreweries = [
      { id: 'b1', name: 'Test Brewery One', brewery_type: 'micro', city: 'City A', street: '123 Main St', phone: '1234567890' },
      { id: 'b2', name: 'Test Brewery Two', brewery_type: 'brewpub', city: 'City B', street: '456 Elm St', phone: '0987654321' },
      { id: 'b3', name: 'Test Brewery Three', brewery_type: 'micro', city: 'City C', street: '789 Oak St', phone: '1122334455' },
      { id: 'b4', name: 'Test Brewery Four', brewery_type: 'regional', city: 'City D', street: '101 Pine St', phone: '6677889900' },
      { id: 'b5', name: 'Test Brewery Five', brewery_type: 'brewpub', city: 'City E', street: '202 Maple St', phone: '5566778899' }
    ];
    mockResultsSignal.set(testBreweries);
    mockShowFullSignal.set(true);
    component.searchControl.setValue('test');
    const results = component.displayResults();
    expect(results.length).toBe(5);
  });

  // Pagination and Limit Tests
  it('displayResults returns exactly 5 when more than 5 match but showFullResults is false', () => {
    const testBreweries = Array.from({ length: 10 }, (_, i) => ({
      id: `b${i + 1}`,
      name: `Test Brewery ${i + 1}`,
      brewery_type: 'micro' as const,
      city: `City ${i + 1}`,
      street: `${i + 1} Main St`,
      phone: `${i + 1}234567890`
    }));
    mockResultsSignal.set(testBreweries);
    mockShowFullSignal.set(false);
    component.searchControl.setValue('test');
    const results = component.displayResults();
    expect(results.length).toBe(5);
  });

  it('displayResults handles empty search control value', () => {
    mockResultsSignal.set([
      { id: 'b1', name: 'Brewery One', brewery_type: 'micro', city: 'City A', street: '123 Main St', phone: '1234567890' }
    ]);
    component.searchControl.setValue('');
    const results = component.displayResults();
    expect(results.length).toBe(1);
  });

  // Filtering and Search Behavior Tests
  it('displayResults is case insensitive', () => {
    mockResultsSignal.set([
      { id: 'b1', name: 'BREWERY', brewery_type: 'micro', city: 'City A', street: '123 Main St', phone: '1234567890' }
    ]);
    component.searchControl.setValue('brewery');
    const results = component.displayResults();
    expect(results.length).toBe(1);
  });

  it('displayResults partial match works', () => {
    mockResultsSignal.set([
      { id: 'b1', name: 'Brewery One', brewery_type: 'micro', city: 'City A', street: '123 Main St', phone: '1234567890' },
      { id: 'b2', name: 'Other Place', brewery_type: 'brewpub', city: 'City B', street: '456 Elm St', phone: '0987654321' }
    ]);
    component.searchControl.setValue('brew');
    const results = component.displayResults();
    expect(results.length).toBe(1);
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

  it('displayResults limits results to 5 when showFullResults is false', () => {
    mockResultsSignal.set([
      { id: 'b1', name: 'Brewery One', brewery_type: 'micro', city: 'City A', street: '123 Main St', phone: '1234567890' },
      { id: 'b2', name: 'Brewery Two', brewery_type: 'brewpub', city: 'City B', street: '456 Elm St', phone: '0987654321' },
      { id: 'b3', name: 'Brewery Three', brewery_type: 'micro', city: 'City C', street: '789 Oak St', phone: '1122334455' },
      { id: 'b4', name: 'Brewery Four', brewery_type: 'micro', city: 'City D', street: '101 Pine St', phone: '6677889900' },
      { id: 'b5', name: 'Brewery Five', brewery_type: 'brewpub', city: 'City E', street: '202 Maple St', phone: '5566778899' },
      { id: 'b6', name: 'Brewery Six', brewery_type: 'micro', city: 'City F', street: '303 Oak St', phone: '4455667788' }
    ]);

    mockShowFullSignal.set(false);
    component.searchControl.setValue('brewery');
    const results = component.displayResults();
    expect(results.length).toBe(5);
  });

  it('displayResults handles whitespace in search', () => {
    mockResultsSignal.set([
      { id: 'b1', name: 'Brewery One', brewery_type: 'micro', city: 'City A', street: '123 Main St', phone: '1234567890' }
    ]);

    component.searchControl.setValue('  brewery  ');
    const results = component.displayResults();
    expect(results.length).toBe(1);
  });

  // Notification and Toast Message Tests
  it('should trigger success toaster when displayResults has data', () => {
    const toastr = TestBed.inject(ToastrService);
    
    mockResultsSignal.set([
      { id: 'b1', name: 'Brewery One', brewery_type: 'micro', city: 'City A', street: '123 Main St', phone: '1234567890' }
    ]);
    component.searchControl.setValue('brewery');
    
    // Accessing displayResults triggers the effect
    component.displayResults();
    fixture.detectChanges();
    
    // Success toaster should be called when results > 0
    expect(toastr.success).toHaveBeenCalled();
  });

  it('should trigger info toaster when no matching results found', () => {
    const toastr = TestBed.inject(ToastrService);
    
    // Store has results but displayResults filters them out
    mockResultsSignal.set([
      { id: 'b1', name: 'Something Else', brewery_type: 'micro', city: 'City A', street: '123 Main St', phone: '1234567890' }
    ]);
    component.searchControl.setValue('brewery');
    
    // This should not match, so displayResults will be empty
    component.displayResults();
    fixture.detectChanges();
    
    // Info toaster should be called when no matching results
    expect(toastr.info).toHaveBeenCalled();
  });

  it('should not trigger toaster when search term is too short', () => {
    const toastr = TestBed.inject(ToastrService);
    
    mockResultsSignal.set([
      { id: 'b1', name: 'Brewery One', brewery_type: 'micro', city: 'City A', street: '123 Main St', phone: '1234567890' }
    ]);
    component.searchControl.setValue('br');
    
    component.displayResults();
    fixture.detectChanges();
    
    // With only 2 chars, info toaster should not be called
    expect(toastr.info).not.toHaveBeenCalled();
  });

  it('should not trigger info toaster when storeResults is empty', () => {
    const toastr = TestBed.inject(ToastrService);
    
    // Both displayResults and storeResults are empty
    mockResultsSignal.set([]);
    component.searchControl.setValue('test');
    
    component.displayResults();
    fixture.detectChanges();
    
    // Should not call info toaster when store results are empty
    expect(toastr.info).not.toHaveBeenCalled();
  });
});
