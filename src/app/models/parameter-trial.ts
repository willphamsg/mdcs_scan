export interface INewParameterApproval {
  chk: boolean;
  id: number;
  version: number;
  depot_id: string;
  depot_name: string;
  depot?: {
    depot_id: string;
    version: number;
    depot_name: string;
    depot_code: string;
  };
  parameter_name: string;
  parameter_version: string;
  status: string;
  status_code: number;
  updated_on: string;
  last_update: string;
}

export interface IParameterMode {
  chk: boolean;
  id: number;
  version: number;
  depot_id: string;
  depot_name: string;
  depot?: {
    depot_id: string;
    version: number;
    depot_name: string;
    depot_code: string;
  };
  parameter_name: string;
  parameter_version: string;
  status: string;
}

export interface ITrialDeviceSelection {
  chk: boolean;
  id: number;
  depot_id: string;
  depot: any;
  bus_num: string;
  trial_group: string;
  service_group: string;
  parameter_group: string;
}

export interface IParameterVersionSummary {
  chk: boolean;
  id: number;
  version: number;
  depot_id: string;
  depot?: {
    depot_id: string;
    version: number;
    depot_name: string;
    depot_code: string;
  };
  file_id: string;
  parameter_name: string;
  parameter_version: string;
  effective_date: string;
  status: string;
}

export interface IEndTrial {
  chk: boolean;
  id: number;
  version: number;
  depot_id: string;
  depot_name: string;
  depot?: {
    depot_id: string;
    version: number;
    depot_name: string;
    depot_code: string;
  };
  file_id: string;
  parameter_name: string;
  parameter_version: string;
  effective_date: string;
}
