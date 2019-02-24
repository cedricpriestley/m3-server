import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { Observable, of } from 'rxjs';
//import { SearchResult } from '../models/search-result.model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private http: HttpClient) { }

  search(query: string): Observable<Object[]> {
    if (!query) return of([]);

    let results = new Observable<Object[]>();
    let queryUrl = '';

    queryUrl = `https://musicbrainz.org/ws/2/artist?limit=50&offset=0&fmt=json&query=${query}`;
    results['artists'] = this.http.get(queryUrl).pipe(map(response => {
      return response['artists'].map(entity => {
        entity['_entity_type'] = 'artist';
        return entity;
      });
    }));

    queryUrl = `https://musicbrainz.org/ws/2/release?limit=50&offset=0&fmt=json&query=${query}`;
    results['releases'] = this.http.get(queryUrl).pipe(map(response => {
      return response['release'].map(entity => {
        entity['_entity_type'] = 'release';
        return entity;
      });
    }));

    queryUrl = `https://musicbrainz.org/ws/2/recording?limit=50&offset=0&fmt=json&query=${query}`;
    results['recordings'] = this.http.get(queryUrl).pipe(map(response => {
      return response['recordings'].map(entity => {
        entity['_entity_type'] = 'recording';
        return entity;
      });
    }));

    console.log(results['artists']);
    return results;
  }
}
