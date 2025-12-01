export interface ReportType {
  id: number;
  label: string;
}

export interface IReportList {
  chk: boolean;
  id: number;
  depot_name: string;
  report_type: string;
  business_date?: string;
}
