import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { ToastrService } from 'ngx-toastr';

/**
 * Root App Component Tests
 * Tests the main application component initialization and setup
 */
describe('App Component', () => {
  // Configure testing module with required providers and imports
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: ToastrService, useValue: {
          success: jasmine.createSpy(),
          error: jasmine.createSpy(),
          warning: jasmine.createSpy(),
          info: jasmine.createSpy(),
        }}
      ],
    }).compileComponents();
  });

  // Component Creation Tests
  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    // Verify component is created and instantiated
    expect(app).toBeTruthy();
  });
});