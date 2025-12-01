import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PayloadResponse, DailyReportRequest, IParams } from '@models/common';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from './message.service';
import { environment } from '@env/environment';
import DummyData from '@data/db.json';
import { of } from 'rxjs';
import { DynamicEndpoint } from './dynamic-endpoint';
@Injectable({
  providedIn: 'root',
})
export class DailyReportService {
  private uri = environment.gateway + 'master-bus-list/';
  constructor(
    private http: HttpClient,
    public dialog: MatDialog,
    private dynamic: DynamicEndpoint
  ) {
    this.uri = this.dynamic.setDynamicEndpoint('report', this.uri);
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
      return of(dummyData);
    }
    return this.http.post<PayloadResponse>(`${this.uri}search`, params);
  }

  // search(params: DailyReportRequest): Observable<PayloadResponse> {
  //   if (environment?.useDummyData) {
  //     const dummyData: PayloadResponse = {
  //       status: 200,
  //       status_code: 'SUCCESS',
  //       timestamp: Date.now(),
  //       message: 'Dummy data fetched successfully',
  //       payload:
  //         params?.report_type === 'All'
  //           ? DummyData
  //           : {
  //               ...DummyData,
  //               'daily-report': DummyData['daily-report']?.filter(
  //                 item =>
  //                   item.report_type?.toLocaleLowerCase() ===
  //                   params?.report_type.toLocaleLowerCase()
  //               ),
  //             },
  //     };
  //     return of(dummyData);
  //   }
  //   return this.http.post<PayloadResponse>(`${this.uri}search`, params);
  // }
}
