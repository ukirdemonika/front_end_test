import { TestBed } from '@angular/core/testing';
import { BreweryService } from './brewery.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Brewery } from '../models/brewery.model';

/**
 * Brewery Service Tests
 * Tests HTTP service for brewery search API integration
 */
describe('BreweryService', () => {
  let service: BreweryService;
  // HTTP testing utility for mocking API calls
  let httpMock: HttpTestingController;

  const API_URL = 'https://api.openbrewerydb.org/v1/breweries/search';

  // Configure service and HTTP testing
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BreweryService],
    });

    service = TestBed.inject(BreweryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // Service Creation Test
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Input Validation Tests - empty and whitespace handling
  it('should return empty array if query is empty', (done) => {
    service.search('').subscribe((res) => {
      expect(res).toEqual([]);
      done();
    });

    httpMock.expectNone(() => true);
  });

  it('should return empty array if query is whitespace only', (done) => {
    service.search('   ').subscribe((res) => {
      expect(res).toEqual([]);
      done();
    });

    httpMock.expectNone(() => true);
  });

  // API Success Tests - successful brewery search
  it('should call API and return breweries', (done) => {
    const mockBreweries: Brewery[] = [
      { id: '1', name: 'Test Brewery' } as Brewery,
    ];

    service.search('test').subscribe((res) => {
      expect(res.length).toBe(1);
      expect(res).toEqual(mockBreweries);
      done();
    });

    const req = httpMock.expectOne(
      `${API_URL}?query=test&per_page=10`
    );

    expect(req.request.method).toBe('GET');
    req.flush(mockBreweries);
  });

  it('should call API with correct URL parameters', (done) => {
    const mockBreweries: Brewery[] = [];

    service.search('ipa').subscribe((res) => {
      expect(res).toEqual([]);
      done();
    });

    const req = httpMock.expectOne(
      `${API_URL}?query=ipa&per_page=10`
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.url).toContain('query=ipa');
    expect(req.request.url).toContain('per_page=10');
    req.flush(mockBreweries);
  });

  it('should return multiple breweries from API', (done) => {
    const mockBreweries: Brewery[] = [
      { id: '1', name: 'Brewery One' } as Brewery,
      { id: '2', name: 'Brewery Two' } as Brewery,
      { id: '3', name: 'Brewery Three' } as Brewery,
    ];

    service.search('beer').subscribe((res) => {
      expect(res.length).toBe(3);
      expect(res[0].id).toBe('1');
      expect(res[1].id).toBe('2');
      expect(res[2].id).toBe('3');
      done();
    });

    const req = httpMock.expectOne(
      `${API_URL}?query=beer&per_page=10`
    );

    req.flush(mockBreweries);
  });

  // Error Handling Tests - API error responses
  it('should return empty array on API error', (done) => {
    service.search('fail').subscribe((res) => {
      expect(res).toEqual([]);
      done();
    });

    const req = httpMock.expectOne(
      `${API_URL}?query=fail&per_page=10`
    );

    req.error(new ErrorEvent('Network error'));
  });
});