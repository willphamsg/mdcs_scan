export interface IStatusCategory {
  category: string;
  item: IStatusItem;
}

interface IStatusItem {
  name: string;
  status: string;
  lastUpdate: string;
}

export interface IEodProcess {
  taskName: string;
  description: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface IAudtitLog {
  id: string;
  depot_id: string;
  userId: string;
  dateTime: string;
  startDate: string;
  endDate: string;
  updateType: string;
  description: string;
}

export interface IUpdateType {
  [key: string]: string;
}

export interface ISystemInfoDetail {
  label: string;
  value?: { id: string; label: string };
  subDetails?: ISystemInfoDetail[];
}

export interface ISystemInfo {
  label: string;
  details?: ISystemInfoDetail[];
  value?: { id: string; label: string };
  children?: ISystemInfo[];
}
