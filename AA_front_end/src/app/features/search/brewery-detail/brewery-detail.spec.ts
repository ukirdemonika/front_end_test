import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreweryDetail } from './brewery-detail';
import { Brewery } from '../../../core/models/brewery.model';

describe('BreweryDetail', () => {
  let component: BreweryDetail;
  let fixture: ComponentFixture<BreweryDetail>;

  const mockBrewery: Brewery = {
    id: '1',
    name: 'Test Brewery',
  } as Brewery;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreweryDetail], // standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(BreweryDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept brewery input', () => {
    fixture.componentRef.setInput('brewery', mockBrewery);
    fixture.detectChanges();

    expect(component.brewery()).toEqual(mockBrewery);
  });

  it('should emit close event', () => {
    const spy = jasmine.createSpy('closeSpy');
    component.close.subscribe(spy);

    component.close.emit();

    expect(spy).toHaveBeenCalled();
  });

  it('should have faXmark icon defined', () => {
    expect(component.faXmark).toBeTruthy();
  });
});