import { TestBed } from '@angular/core/testing';
import { BreweryService } from './brewery.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Brewery } from '../models/brewery.model';

describe('BreweryService', () => {
  let service: BreweryService;
  let httpMock: HttpTestingController;

  const API_URL = 'https://api.openbrewerydb.org/v1/breweries/search';

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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty array if query is empty', (done) => {
    service.search('').subscribe((res) => {
      expect(res).toEqual([]);
      done();
    });

    httpMock.expectNone(() => true);
  });

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