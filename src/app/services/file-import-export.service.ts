import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IParams, PayloadResponse } from '@app/models/common';
import { IDepoList } from '@app/models/depo';
import { IFile } from '@app/models/parameter-management';
import DummyData from '@data/db.json';
import { environment } from '@env/environment';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root',
})
export class FileImportExportService {
  private uri = environment.gateway + 'param/';
  // private handler = inject(HttpBackend);

  constructor(
    private http: HttpClient,
    private message: MessageService
  ) {}

  search(params: IParams): Observable<PayloadResponse> {
    if (environment?.useDummyData) {
      const dummyData: PayloadResponse = {
        status: 200,
        status_code: 'SUCCESS',
        timestamp: Date.now(),
        message: 'Dummy data fetched successfully',
        payload: DummyData,
      };
      return this.http
        .post<PayloadResponse>(`${this.uri}export/search`, params)
        .pipe(
          catchError((err: HttpErrorResponse) => this.message.multiError(err))
        );
    }
    return this.http
      .post<PayloadResponse>(`${this.uri}export/search`, params)
      .pipe(
        catchError((err: HttpErrorResponse) => this.message.multiError(err))
      );
  }

  sendExportRequest(ids: number[]): Observable<PayloadResponse> {
    if (environment?.useDummyData) {
      const dummyData: PayloadResponse = {
        status: 200,
        status_code: 'SUCCESS',
        timestamp: Date.now(),
        message: 'Dummy data fetched successfully',
        payload: DummyData,
      };
      return this.http
        .post<PayloadResponse>(`${this.uri}export/send-file-request`, { ids })
        .pipe(
          catchError((err: HttpErrorResponse) => this.message.multiError(err))
        );
    }
    return this.http
      .post<PayloadResponse>(`${this.uri}export/send-file-request`, { ids })
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

  import(formData: any, count: number = 0): Observable<PayloadResponse> {
    const itemCount = Array.from(formData?.entries()).length;
    console.log('Uploading zip file with', itemCount, 'items');
    return this.http
      .post<PayloadResponse>(`${this.uri}import/upload/zip`, {
        itemCount,
        count,
      })
      .pipe(
        catchError((err: HttpErrorResponse) => this.message.multiError(err))
      );
  }
}
