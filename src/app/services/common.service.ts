import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  DepoRequest,
  IOperatorList,
  PayloadResponse,
} from '@app/models/common';
import DummyData from '@data/db.json';
import { environment } from '@env/environment';
import { BehaviorSubject, catchError, Observable, of } from 'rxjs';
import { DynamicEndpoint } from './dynamic-endpoint';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private uri = environment.gateway + 'svc-provider/';
  private operatorList: BehaviorSubject<IOperatorList[]> = new BehaviorSubject<
    IOperatorList[]
  >([]);
  operatorList$: Observable<IOperatorList[]> = this.operatorList.asObservable();
  constructor(
    private http: HttpClient,
    private message: MessageService,
    private dynamic: DynamicEndpoint
  ) {
    this.uri = this.dynamic.setDynamicEndpoint('common', this.uri);
  }

  validateBusNumber(e: any) {
    const regex = new RegExp('^[a-zA-Z0-9 ]+$');
    const letters = e.target.value.match(/[a-zA-Z]/g);
    const digits = e.target.value.match(/[0-9]/g);
    const val = String.fromCharCode(!e.charCode ? e.which : e.charCode);

    !isNaN(Number(val))
      ? digits != null
        ? digits.push(val)
        : ''
      : letters != null
        ? letters.push(val)
        : '';

    if (digits != null && digits.length > 4) {
      e.preventDefault();
      return false;
    }

    if (letters != null && letters.length > 3) {
      e.preventDefault();
      return false;
    }

    if (regex.test(val)) {
      return true;
    }

    e.preventDefault();
    return false;
  }

  updateOperatorList(updateOperator: IOperatorList[]) {
    this.operatorList.next(updateOperator);
  }

  search(params: DepoRequest): Observable<PayloadResponse> {
    if (environment.useDummyData) {
      const dummyData: PayloadResponse = {
        status: 200,
        status_code: 'SUCCESS',
        timestamp: Date.now(),
        message: 'Dummy data fetched successfully',
        payload: DummyData,
      };
      return of(dummyData);
    }

    return this.http
      .post<PayloadResponse>(`${this.uri}search`, params)
      .pipe(
        catchError((err: HttpErrorResponse) => this.message.multiError(err))
      );
  }

  getGeneralInformation(isDagw: boolean): Observable<PayloadResponse> {
    const uri = `${environment.gateway}general-information`;
    if (environment.useDummyData) {
      const dummyData: PayloadResponse = {
        status: 200,
        status_code: 'SUCCESS',
        timestamp: Date.now(),
        message: 'Dummy data fetched successfully',
        payload: DummyData,
      };
      return this.http
        .get<PayloadResponse>(`${uri}?dagw=${isDagw}`)
        .pipe(
          catchError((err: HttpErrorResponse) => this.message.multiError(err))
        );
    }

    return this.http
      .get<PayloadResponse>(uri)
      .pipe(
        catchError((err: HttpErrorResponse) => this.message.multiError(err))
      );
  }
}
