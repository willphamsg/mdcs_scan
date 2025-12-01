import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IParams, PayloadResponse } from '@app/models/common';
import { IDepoList } from '@app/models/depo';
import {
  IAudtitLog,
  IEodProcess,
  IStatusCategory,
  ISystemInfo,
  IUpdateType,
} from '@app/models/maitenance';
import DummyData from '@data/db.json';
import { environment } from '@env/environment';
import { BehaviorSubject, map, Observable, of, catchError } from 'rxjs';
import { MessageService } from './message.service';

/**
 * TODO: Remove unused code when API is integrated....
 * NEEDS TO REWORK THIS SERVICE WHEN API IS FINALIZED
 */
@Injectable({
  providedIn: 'root',
})
export class MaintenanceSharedService {
  private uri = environment.gateway;

  private selectedDepotSubject = new BehaviorSubject<IDepoList | null>(null);
  selectedDepot$ = this.selectedDepotSubject.asObservable();

  private formGroupSubject = new BehaviorSubject<FormGroup | null>(null);

  constructor(
    private http: HttpClient,
    private message: MessageService
  ) {}

  get formGroup$() {
    return this.formGroupSubject.asObservable();
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

      return this.http
        .post<PayloadResponse>(`${this.uri}audit-trail-log/view`, params)
        .pipe(
          catchError((err: HttpErrorResponse) => this.message.multiError(err))
        );
    }
    return this.http
      .post<PayloadResponse>(`${this.uri}audit-trail-log/view`, params)
      .pipe(
        catchError((err: HttpErrorResponse) => this.message.multiError(err))
      );
  }

  setFormGroup(form: any): void {
    this.formGroupSubject.next(form);
  }

  resetFormGroup() {
    const currentFormGroup = this.formGroupSubject.value;
    if (currentFormGroup) {
      currentFormGroup.reset();
    }
  }

  updateSelectedDepot(value: IDepoList | null): void {
    this.selectedDepotSubject.next(value);
  }

  getDiagnosticItem(
    depot_id: string,
    isDagw?: boolean
  ): Observable<PayloadResponse> {
    if (environment.useDummyData) {
      // const dummyData: IStatusCategory[] = DummyData.diagnostics_item;
      return this.http
        .post<PayloadResponse>(`${this.uri}diagnostics/view`, {
          depot_id,
          dagw: isDagw,
        })
        .pipe(
          catchError((err: HttpErrorResponse) => this.message.multiError(err))
        );
    }

    // return this.http.get<IStatusCategory[]>('');
    // return this.http.post<PayloadResponse>(`${this.uri}search`, params);
    return this.http
      .post<PayloadResponse>(`${this.uri}diagnostics/view`, { depot_id })
      .pipe(
        catchError((err: HttpErrorResponse) => this.message.multiError(err))
      );
  }

  getTaskItems(params: IParams): Observable<PayloadResponse> {
    if (environment.useDummyData) {
      const dummyData: IEodProcess[] = DummyData.eod_process_tasks;
      // return of(dummyData);
      return this.http
        .post<PayloadResponse>(
          `${this.uri}eod-process/check-eod-status`,
          params
        )
        .pipe(
          catchError((err: HttpErrorResponse) => this.message.multiError(err))
        );
    }
    return this.http
      .post<PayloadResponse>(`${this.uri}eod-process/check-eod-status`, params)
      .pipe(
        catchError((err: HttpErrorResponse) => this.message.multiError(err))
      );
  }

  forceEOD(): Observable<PayloadResponse> {
    if (environment.useDummyData) {
      return this.http
        .get<PayloadResponse>(`${this.uri}eod-process/force-eod`)
        .pipe(
          catchError((err: HttpErrorResponse) => this.message.multiError(err))
        );
    }
    return this.http
      .get<PayloadResponse>(`${this.uri}eod-process/force-eod`)
      .pipe(
        catchError((err: HttpErrorResponse) => this.message.multiError(err))
      );
  }

  getUpdateTypeItems(): Observable<IUpdateType[]> {
    if (environment.useDummyData) {
      const dummyData = DummyData['update-type'];
      return of(dummyData);
    }
    return this.http.get<IUpdateType[]>('');
  }

  getSystemInformation(
    depot_id: string,
    isDagw?: boolean
  ): Observable<PayloadResponse> {
    if (environment.useDummyData) {
      // const dummyData: IStatusCategory[] = DummyData.diagnostics_item;
      return this.http
        .post<PayloadResponse>(`${this.uri}system-info/fetch`, {
          depot_id,
          dagw: isDagw,
        })
        .pipe(
          catchError((err: HttpErrorResponse) => this.message.multiError(err))
        );
    }

    // return this.http.get<IStatusCategory[]>('');
    // return this.http.post<PayloadResponse>(`${this.uri}search`, params);
    return this.http
      .post<PayloadResponse>(`${this.uri}system-info/fetch`, { depot_id })
      .pipe(
        catchError((err: HttpErrorResponse) => this.message.multiError(err))
      );
  }
}
