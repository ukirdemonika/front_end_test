import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchHistoryComponent } from './search-history';
import { SearchHistory } from '../../../core/models/brewery.model';

describe('SearchHistoryComponent', () => {
  let component: SearchHistoryComponent;
  let fixture: ComponentFixture<SearchHistoryComponent>;

  const mockHistory: SearchHistory[] = [
    {
      id: '1',
      name: 'Test Brewery',
      displayTimestamp: '2026-01-01',
    } as SearchHistory,
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchHistoryComponent], // standalone
    }).compileComponents();

    fixture = TestBed.createComponent(SearchHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept history input', () => {
    fixture.componentRef.setInput('history', mockHistory);
    fixture.detectChanges();

    expect(component.history()).toEqual(mockHistory);
  });

  it('should emit select event', () => {
    const spy = jasmine.createSpy('selectSpy');
    component.select.subscribe(spy);

    component.select.emit(mockHistory[0]);

    expect(spy).toHaveBeenCalledWith(mockHistory[0]);
  });

  it('should emit delete event with id and timestamp', () => {
    const spy = jasmine.createSpy('deleteSpy');
    component.delete.subscribe(spy);

    const event = new Event('click');
    spyOn(event, 'stopPropagation');

    component.onDelete(event, mockHistory[0]);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith({
      id: '1',
      timestamp: '2026-01-01',
    });
  });

  it('should have faXmark defined', () => {
    expect(component.faXmark).toBeTruthy();
  });
});