import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
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
import { BehaviorSubject, map, Observable, of } from 'rxjs';

/**
 * TODO: Remove unused code when API is integrated....
 * NEEDS TO REWORK THIS SERVICE WHEN API IS FINALIZED
 */
@Injectable({
  providedIn: 'root',
})
export class MaintenanceSharedService {
  private selectedDepot = new BehaviorSubject<IDepoList | null>(null);
  selectedDepot$ = this.selectedDepot.asObservable();

  private formGroupSubject = new BehaviorSubject<FormGroup | null>(null);

  constructor(private http: HttpClient) {}

  get formGroup$() {
    return this.formGroupSubject.asObservable();
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
    this.selectedDepot.next(value);
  }

  getDiagnositicItem(depot: IDepoList): Observable<IStatusCategory[]> {
    if (environment.useDummyData) {
      const dummyData: IStatusCategory[] = DummyData.diagnostics_item;
      return of(dummyData);
    }

    return this.http.get<IStatusCategory[]>('');
  }

  getTaskItems(depot: IDepoList): Observable<IEodProcess[]> {
    if (environment.useDummyData) {
      const dummyData: IEodProcess[] = DummyData.eod_process_tasks;
      return of(dummyData);
    }
    return this.http.get<IEodProcess[]>('');
  }

  getAuditLogItems(): Observable<IAudtitLog[]> {
    if (environment.useDummyData) {
      const dummyData = DummyData['audit-log-items'];

      return of(dummyData);
    }
    return this.http.get<IAudtitLog[]>('');
  }

  getUpdateTypeItems(): Observable<IUpdateType[]> {
    if (environment.useDummyData) {
      const dummyData = DummyData['update-type'];
      return of(dummyData);
    }
    return this.http.get<IUpdateType[]>('');
  }

  getSystemInformation(type: string): Observable<ISystemInfo[]> {
    if (environment.useDummyData) {
      switch (type) {
        case 'mdcs': {
          return of(DummyData['mdcs-information']);
        }
        case 'dagw': {
          return of(DummyData['dagw-information']);
        }
      }
    }
    return this.http.get<ISystemInfo[]>('');
  }
}
