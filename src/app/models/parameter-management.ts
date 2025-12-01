import { Validators } from '@angular/forms';
import { IDepoList } from './depo';

export class DepotFileList {
  depot = ['', Validators.required];
  fileName = [{ value: '', disabled: true }];
}
export class MessageFile {
  businessDate = ['', Validators.required];
  fileName = [{ value: '', disabled: true }];
}

export interface IDepotFileList {
  depot: string;
  fileName: string;
}

export interface IMessageFile {
  businessDate: string;
  fileName: string;
}

export interface IParameterStatus {
  isActive: boolean;
  value: string;
}

export interface IDagwParameterSummary {
  id: number;
  version: number;
  depot_id: string;
  depot?: {
    depot_id: string;
    version: number;
    depot_name: string;
    depot_code: string;
  };
  parameter_name: string;
  mdcs_live: IParameterStatus;
  dagw1_live?: IParameterStatus;
  dagw2_live?: IParameterStatus;
  mdcs_trial?: IParameterStatus;
  dagw1_trial?: IParameterStatus;
  dagw2_trial?: IParameterStatus;
  effective_date: string;
  consistency: string;
}

export interface IParameterViewerItems {
  device_label: string;
  device_type: string;
  device_items: IParameterDataItems[];
}

export interface IParameterDepotItems {
  item_code: string;
  items: IDepoList[];
}

export interface IParameterDataItems {
  id: number;
  label: string;
  item_code: string;
}

export interface IParameterViewerData {
  fileId: string;
  parameter_name: string;
  parameter_version: string;
  format_version: string;
  effective_date_time: string;
}

export interface IParameterPayloadDetails {
  no: number;
  user_staff_id: string;
  mdcs_access: string;
}

export interface IParameterBfcConfig {
  key: string;
  value: string;
}

export interface IParameterList {
  id: number;
  value: string;
}

export interface IFile {
  id: number;
  // depot: string;
  fileId: string;
  parameterName: string;
  version: string;
  status: string;
  effectiveDateTime?: string;
  type?: string;
  description?: string;
  chk?: boolean;
}

export interface IBusCashFare {
  no: number;
  service_category: number;
  adult_idfc_btn: IFareButton;
  child_idfc_btn: IFareButton;
  senior_idfc_btn: IFareButton;
}

export interface IFareButton {
  no_1: number;
  no_2: number;
  no_3: number;
  no_4?: number;
  no_5?: number;
  no_6?: number;
  no_7?: number;
  no_8?: number;
}
