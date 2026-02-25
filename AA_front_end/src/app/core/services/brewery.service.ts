/* ======================================================
This service is responsible for fetching brewery data from the Open Brewery DB API. 
It provides a search method that takes a query string and returns an Observable of Brewery arrays. 
The service uses Angular's HttpClient to make HTTP requests and includes error handling to return an empty array if the request fails.
====================================================== */

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Brewery } from '../models/brewery.model';
import { catchError, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BreweryService {
  private http = inject(HttpClient);

  private readonly API_URL = 'https://api.openbrewerydb.org/v1/breweries/search';

  search(query: string): Observable<Brewery[]> {
    if (!query.trim()) return of([]);
    // per_page=10 to fulfill the "max 10" requirement
    return this.http
      .get<Brewery[]>(`${this.API_URL}?query=${query}&per_page=10`)
      .pipe(catchError(() => of([])));
  }
}
