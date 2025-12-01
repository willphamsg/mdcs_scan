import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { PayloadResponse, IParams } from '../models/common';
import { ICardKeyVersion } from '../models/card-key-version';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '@env/environment';
import DummyData from '@data/db.json';
import { MessageService } from './message.service';
import { DynamicEndpoint } from './dynamic-endpoint';

@Injectable({
  providedIn: 'root',
})
export class ManageCardKeyVersionService {
  private uri = environment.gateway + 'card-key-version/';
  constructor(
    private http: HttpClient,
    public dialog: MatDialog,
    private dynamic: DynamicEndpoint
  ) {
    this.uri = this.dynamic.setDynamicEndpoint('common', this.uri);
  }

  search(params: IParams): Observable<PayloadResponse> {
    if (environment?.useDummyData) {
      const dummyData: PayloadResponse = {
        status: 200,
        status_code: 'SUCCESS',
        timestamp: Date.now(),
        message: 'Dummy data fetched successfully',
        payload: DummyData,
      };
      // return of(dummyData);

      console.log({ requestParams: params });
      return this.http
        .get<PayloadResponse>(`${this.uri}search`)
        .pipe(catchError((err: HttpErrorResponse) => of(dummyData)));
    }
    return this.http.post<PayloadResponse>(`${this.uri}search`, params);
  }
}
