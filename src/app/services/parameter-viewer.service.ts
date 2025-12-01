import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IBustList } from '@app/models/bus-list';
import {
  IBusCashFare,
  IParameterBfcConfig,
  IParameterDepotItems,
  IParameterList,
  IParameterPayloadDetails,
  IParameterViewerData,
  IParameterViewerItems,
} from '@app/models/parameter-management';
import DummyData from '@data/db.json';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable, catchError, of } from 'rxjs';
import { BusRequest, PayloadResponse } from '../models/common';
import { IParameterVersionSummary } from '../models/parameter-trial';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root',
})
export class ParameterViewerService {
  constructor(
    private http: HttpClient,
    public dialog: MatDialog,
    private message: MessageService
  ) {}

  /**
   * TODO: Separate Service Data for clean service
   * Rework when API is available
   */

  getSystemParametersItems(type: string): Observable<IParameterViewerItems[]> {
    if (environment?.useDummyData) {
      const dummyData = this.getDummySystemParametersItems(type);
      return of(dummyData);
    }

    return this.http.get<IParameterViewerItems[]>('');
  }

  private getDummySystemParametersItems(type: string): IParameterViewerItems[] {
    switch (type) {
      case 'DAGW':
        return DummyData.parameter_device_dagw_items;
      case 'MDCS':
        return DummyData.parameter_device_mdcs_items;
      case 'BD':
        return DummyData.parameter_device_bd_items;
      case 'ID':
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
    if (environment?.useDummyData) {
      const dummyData: IParameterDepotItems =
        DummyData.parameter_viewer_depot_item.find(
          (data: IParameterDepotItems) => data.item_code === item
        )!;

      return of(dummyData);
    }

    return this.http.get<IParameterDepotItems>('');
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

    return this.http.get<IParameterList[]>('');
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
}
