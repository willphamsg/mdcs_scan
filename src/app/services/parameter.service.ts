import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { BusRequest, IParams, PayloadResponse } from '../models/common';
import { INewParameterApproval } from '../models/parameter-trial';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '@env/environment';
import DummyData from '@data/db.json';
import { MessageService } from './message.service';
import { DynamicEndpoint } from './dynamic-endpoint';

@Injectable({
  providedIn: 'root',
})
export class ParameterService {
  private uri = environment.gateway + 'parameter/trial/';
  constructor(
    private http: HttpClient,
    public dialog: MatDialog,
    private message: MessageService,
    private dynamic: DynamicEndpoint
  ) {
    this.uri = this.dynamic.setDynamicEndpoint('param', this.uri);
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
          parameter_status_table_list: DummyData?.new_parameter_approval_list,
        },
      };
      return of(dummyData);
    }
    return this.http.post<PayloadResponse>(`${this.uri}search`, params);
  }

  manage(
    params: INewParameterApproval[],
    action: string
  ): Observable<PayloadResponse> {
    if (environment?.useDummyData) {
      const dummyData: PayloadResponse = {
        status: 200,
        status_code: 'SUCCESS',
        timestamp: Date.now(),
        message: 'Updated successfully',
        payload: DummyData,
      };
      return of(dummyData);
    }
    return this.http.post<PayloadResponse>(`${this.uri}${action}`, params);
  }
}
