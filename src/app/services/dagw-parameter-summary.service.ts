import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { BusRequest, IParams, PayloadResponse } from '../models/common';
import { IDagwParameterSummary } from '../models/parameter-management';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '@env/environment';
import DummyData from '@data/db.json';
import { MessageService } from './message.service';
import { IDepoList } from '@app/models/depo';
import { DynamicEndpoint } from './dynamic-endpoint';

@Injectable({
  providedIn: 'root',
})
export class DagwParameterSummaryService {
  private uri = environment.gateway + 'dagw-param-version-summary/';
  private depotListSubject: BehaviorSubject<IDepoList[]> = new BehaviorSubject<
    IDepoList[]
  >([]);

  constructor(
    private http: HttpClient,
    public dialog: MatDialog,
    private dynamic: DynamicEndpoint,
    private message: MessageService
  ) {
    this.uri = this.dynamic.setDynamicEndpoint('param', this.uri);
  }

  get depotList(): IDepoList[] {
    return this.depotListSubject.value;
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
      // console.log('Request Params:', params);
      return this.http
        .post<PayloadResponse>(`${this.uri}search`, params)
        .pipe(
          catchError((err: HttpErrorResponse) => this.message.multiError(err))
        );
    }
    return this.http
      .post<PayloadResponse>(`${this.uri}search`, params)
      .pipe(
        catchError((err: HttpErrorResponse) => this.message.multiError(err))
      );
  }

  // REMOVE THIS, USE SEARCH WHEN API IS AVAILABLE
  getDepotService(type: string): Observable<IDepoList[]> {
    if (environment?.useDummyData) {
      const dummyData = DummyData.dagw_depot_list;

      return of(dummyData).pipe(
        tap((depots: IDepoList[]) => {
          this.depotListSubject.next(depots);
        }),

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

  getDagwDataList(type: string): Observable<IDagwParameterSummary[]> {
    if (environment.useDummyData) {
      const dummyData = DummyData.dagw_parameter_summary;

      return of(dummyData);
    }
    return this.http.get<IDagwParameterSummary[]>('');
  }
}
