import { TestBed } from '@angular/core/testing';
import { HistoryService } from './history.service';
import { SearchHistory } from '../models/brewery.model';

describe('HistoryService', () => {
  let service: HistoryService;

  const KEY = 'aa_brewery_history';

  const createItem = (id: string): SearchHistory => ({
    id,
    name: `Brewery ${id}`,
    brewery_type: 'micro',
    street: 'Main St',
    city: 'City',
    phone: '123',
    displayTimestamp: new Date().toISOString(),
  });

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [HistoryService],
    });

    service = TestBed.inject(HistoryService);
  });

  /* ---------------- LOAD ---------------- */

  it('should initialize with empty history when localStorage empty', () => {
    expect(service.history()).toEqual([]);
  });

  it('should load history from localStorage', () => {
    const items = [createItem('1')];
    localStorage.setItem(KEY, JSON.stringify(items));

    const newService = new HistoryService();
    expect(newService.history()).toEqual(items);
  });

  /* ---------------- SAVE ---------------- */

  it('should save item to history', () => {
    const item = createItem('1');

    service.save(item);

    expect(service.history().length).toBe(1);
    expect(service.history()[0].id).toBe('1');
  });

  it('should remove duplicates by id when saving', () => {
    const item1 = createItem('1');
    const item2 = { ...createItem('1'), displayTimestamp: new Date().toISOString() };

    service.save(item1);
    service.save(item2);

    expect(service.history().length).toBe(1);
    expect(service.history()[0].displayTimestamp).toBe(item2.displayTimestamp);
  });

  it('should keep only latest 10 items', () => {
    for (let i = 0; i < 12; i++) {
      service.save(createItem(String(i)));
    }

    expect(service.history().length).toBe(10);
  });

  it('should persist history to localStorage on save', () => {
    const item = createItem('1');

    service.save(item);

    const stored = JSON.parse(localStorage.getItem(KEY)!);
    expect(stored.length).toBe(1);
  });

  /* ---------------- DELETE ---------------- */

  it('should delete specific history item', () => {
    const item = createItem('1');
    service.save(item);

    service.delete(item.id, item.displayTimestamp);

    expect(service.history().length).toBe(0);
  });

  it('should persist delete to localStorage', () => {
    const item = createItem('1');
    service.save(item);

    service.delete(item.id, item.displayTimestamp);

    const stored = JSON.parse(localStorage.getItem(KEY)!);
    expect(stored.length).toBe(0);
  });
});