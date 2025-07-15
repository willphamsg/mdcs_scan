import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from './message.service';
import { DynamicEndpoint } from './dynamic-endpoint';
import { environment } from '@env/environment';
import { IParams, PayloadResponse } from '@app/models/common';
import { catchError, Observable, of } from 'rxjs';
import DummyData from '@data/db.json';

@Injectable({
  providedIn: 'root',
})
export class BusOperationService {
  private uri = environment.gateway + 'bus-operation-status/';
  constructor(
    private http: HttpClient,
    public dialog: MatDialog,
    private message: MessageService,
    private dynamic: DynamicEndpoint
  ) {
    this.uri = this.dynamic.setDynamicEndpoint('bus', this.uri);
  }

  search(params: IParams): Observable<PayloadResponse> {
    if (environment?.useDummyData) {
      const dummyData: PayloadResponse = {
        status: 200,
        status_code: 'SUCCESS',
        timestamp: Date.now(),
        message: 'Dummy data fetched successfully',
        payload: {
          ...DummyData,
          bus_operation_status: DummyData?.bus_operation_list,
        },
      };
      return of(dummyData);
    }
    return this.http
      .post<PayloadResponse>(`${this.uri}search`, params)
      .pipe(
        catchError((err: HttpErrorResponse) => this.message.multiError(err))
      );
  }
}
