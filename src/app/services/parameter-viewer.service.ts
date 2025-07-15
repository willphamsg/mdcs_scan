import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IBustList } from '@app/models/bus-list';
import {
  IBusCashFare,
  IFareButton,
  IParameterBfcConfig,
  IParameterDepotItems,
  IParameterList,
  IParameterPayloadDetails,
  IParameterTab,
  IParameterViewerData,
  IParameterViewerItems,
} from '@app/models/parameter-management';
import Param_BLS1ConfigGrid from '@data/Param_BLS1ConfigGrid.json';
import DummyData from '@data/db.json';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable, catchError, of } from 'rxjs';
import { BusRequest, PayloadResponse } from '../models/common';
import { IParameterVersionSummary } from '../models/parameter-trial';
import { MessageService } from './message.service';
import { DynamicEndpoint } from './dynamic-endpoint';
import { DepoService } from './depo.service';
import { IDepoList } from '@app/models/depo';

@Injectable({
  providedIn: 'root',
})
export class ParameterViewerService {
  private uri = environment.gateway + 'parameter/view/';
  depots: IDepoList[] = [];
  constructor(
    private http: HttpClient,
    public dialog: MatDialog,
    private message: MessageService,
    private dynamic: DynamicEndpoint,
    private depoService: DepoService
  ) {
    this.uri = this.dynamic.setDynamicEndpoint('param', this.uri);
    this.depoService.depoList$.subscribe((value: IDepoList[]) => {
      this.depots = value;
    });
  }

  /**
   * TODO: Separate Service Data for clean service
   * Rework when API is available
   */

  getSystemParametersTab(): Observable<PayloadResponse> {
    if (environment?.useDummyData) {
      const dummyData: PayloadResponse = {
        status: 200,
        status_code: 'SUCCESS',
        timestamp: Date.now(),
        message: 'Dummy data fetched successfully',
        payload: {
          tabList: [
            { label: 'MDCS', id: 1, tab_code: 'MDCS' },
            { label: 'DAGW', id: 2, tab_code: 'DAGW' },
            { label: 'Bus Device', id: 3, tab_code: 'BD' },
            { label: 'Inspection Device', id: 4, tab_code: 'ID' },
          ],
        },
      };
      return of(dummyData);
    }
    return this.http
      .get<any>(`${this.uri}view-device-types`)
      .pipe(
        catchError((err: HttpErrorResponse) => this.message.multiError(err))
      );
  }

  getSystemParametersItems(type: number): Observable<PayloadResponse> {
    if (environment?.useDummyData) {
      const payload = this.getDummySystemParametersItems(type);
      const dummyData: PayloadResponse = {
        status: 200,
        status_code: 'SUCCESS',
        timestamp: Date.now(),
        message: 'Dummy data fetched successfully',
        payload: {
          ...DummyData,
          devices: payload,
        },
      };
      return of(dummyData);
    }

    const params = {
      id: type,
    };
    return this.http
      .post<PayloadResponse>(`${this.uri}view-group-list-by-type-Id`, params)
      .pipe(
        catchError((err: HttpErrorResponse) => this.message.multiError(err))
      );
  }

  getDataSource(id: number | undefined): Observable<PayloadResponse> {
    const params = {
      id: id,
    };
    return this.http
      .post<PayloadResponse>(
        `${this.uri}view-parameter-file-by-file-id`,
        params
      )
      .pipe(
        catchError((err: HttpErrorResponse) => this.message.multiError(err))
      );
  }

  private getDummySystemParametersItems(type: number): IParameterViewerItems[] {
    switch (type) {
      case 1:
        return DummyData.parameter_device_dagw_items;
      case 2:
        return DummyData.parameter_device_mdcs_items;
      case 3:
        return DummyData.parameter_device_bd_items;
      case 4:
        return DummyData.parameter_device_id_items;
      default:
        return [];
    }
  }

  getSelectedDepotData(depot: string): Observable<IParameterViewerData> {
    if (environment?.useDummyData) {
      const dummyData: IParameterViewerData =
        DummyData.parameter_viewer_depot_data;

      return of(dummyData);
    }

    return this.http.get<IParameterViewerData>('');
  }

  getDepotData(item: string): Observable<IParameterDepotItems> {
    // if (environment?.useDummyData) {
    //   const dummyData: IParameterDepotItems =
    //     DummyData.parameter_viewer_depot_item.find(
    //       (data: IParameterDepotItems) => data.item_code === item
    //     )!;

    //   return of(dummyData);
    // }
    const obj: IParameterDepotItems = {
      item_code: item,
      items: this.depots,
    };
    return of(obj);
  }

  getParameterBfcConfig(
    paramName: string,
    depot: string,
    busType: string
  ): Observable<IParameterBfcConfig[]> {
    if (environment?.useDummyData) {
      const dummyData: IParameterBfcConfig[] = DummyData.parameter_bfc_config;

      return of(dummyData);
    }
    return this.http.get<IParameterBfcConfig[]>('');
  }

  /**
   *
   * @param type Selected device type
   */
  getParameterList(type: string): Observable<IParameterList[]> {
    if (environment?.useDummyData) {
      const dummyData: IParameterList[] = DummyData.parameter_list;

      return of(dummyData);
    }

    const obj: IParameterList[] = [{ id: 1, value: type }];
    return of(obj);
  }

  getBusList(type: string): Observable<IBustList[]> {
    if (environment?.useDummyData) {
      const dummyData: IBustList[] = DummyData.daily_bus_list.map(
        (bus: any) => ({
          ...bus,
          day_type: bus.day_type ?? 'default_day_type',
        })
      );

      return of(dummyData);
    }

    return this.http.get<IBustList[]>('');
  }

  getUserAccessDetails(): Observable<IParameterPayloadDetails[]> {
    if (environment?.useDummyData) {
      const dummyData: IParameterPayloadDetails[] =
        DummyData.parameter_user_access_details;

      return of(dummyData);
    }

    return this.http.get<IParameterPayloadDetails[]>('');
  }

  getBusCashFareDetails(
    depot: string,
    parameterName: string
  ): Observable<IBusCashFare[]> {
    if (environment?.useDummyData) {
      const dummyData: IBusCashFare[] = DummyData.parameter_bus_cash_fare;

      return of(dummyData);
    }

    return this.http.get<IBusCashFare[]>('');
  }

  parameterMapper(id: number | undefined, payload: any) {
    const json = JSON.parse(payload.payloadData);
    const list = json.objPayloadData.aobjBLS1SpecificConfig[0];
    const param1 = Param_BLS1ConfigGrid.Param1.map((item: any) => {
      return <IParameterBfcConfig>{
        key: item.fieldLabel,
        value: list[item.itemId],
      };
    });

    const param2 = Param_BLS1ConfigGrid.Param2.map((item: any) => {
      return <IParameterBfcConfig>{
        key: item.fieldLabel,
        value: list[item.itemId],
      };
    });

    return {
      param1: param1,
      param2: param2,
    };
  }
}
