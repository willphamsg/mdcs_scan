import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IDepoList } from '@app/models/depo';
import { IFile } from '@app/models/parameter-management';
import DummyData from '@data/db.json';
import { environment } from '@env/environment';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { MessageService } from './message.service';
import { DynamicEndpoint } from './dynamic-endpoint';
import { IParams, PayloadResponse } from '@app/models/common';

@Injectable({
  providedIn: 'root',
})
export class FileImportExportService {
  private uri = environment.gateway + 'daily-bus-list/';
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
          parameter_file_data: DummyData?.parameter_file_data,
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

  // TODO: Use search method when API is ready
  getImportedList(): Observable<IFile[]> {
    if (environment.useDummyData) {
      const dummyData = DummyData.parameter_file_data;

      return of(dummyData);
    }
    return this.http.get<IFile[]>('');
  }

  // Move all depot related in DepotService once API integrated
  getDepotService(type: string): Observable<IDepoList[]> {
    if (environment?.useDummyData) {
      const dummyData = DummyData.dagw_depot_list;

      return of(dummyData).pipe(
        map(data => {
          return data.map(depot => ({
            ...depot,
            value: depot.depot_name,
          }));
        })
      );
    }

    return this.http.get<IDepoList[]>('');
  }
}
