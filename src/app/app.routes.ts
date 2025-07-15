import { Routes } from '@angular/router';
import { SignInComponent } from './views/sign-in/sign-in.component';
import { LayoutComponent } from './components/layout/layout.component';
import { HomeComponent } from './views/dacs/dashboard/home/home.component';
import { DepotOverViewComponent } from './views/dacs/dashboard/depot-over-view/depot-over-view.component';
import { AuthGuard } from './guards/auth.guard';
import { UserViewComponent } from './views/user/user-view/user-view.component';
import { BusExceptionListSearchComponent } from './views/dacs/bus/bus-exception-list/bus-exception-list-search.component';
import { BusSearchComponent } from './views/dacs/bus/daily-bus-list/search/bus-search.component';
import { DagwGuard, MdcsGuard } from './guards/dagw.guard';
import { DagwDashboardComponent } from './views/dagw/dagw-dashboard/dagw-dashboard.component';

import { VehicleSearchComponent } from './views/dacs/bus/vehicle/search/vehicle-search.component';
import { BusOperationSearchComponent } from './views/dacs/monitoring/bus-operation/bus-operation-search.component';
import { ViewCardKeyVersionComponent } from './views/dacs/monitoring/card-key-version/card-key-version.component';
import { BusTransferSearchComponent } from './views/dacs/bus/bus-transfer/search/bus-transfer-search.component';
import { DailyReportComponent } from './views/dacs/daily-report/search/daily-report-search.component';

import { NewParameterApprovalSearchComponent } from './views/dacs/parameter-trial/new-parameter-approval/search/new-parameter-approval-search.component';
import { ParameterModeSearchComponent } from './views/dacs/parameter-trial/parameter-mode/search/parameter-mode-search.component';
import { TrialDeviceSelectionSearchComponent } from './views/dacs/parameter-trial/trial-device-selection/search/trial-device-selection-search.component';
import { ParameterVersionSummarySearchComponent } from './views/dacs/parameter-trial/parameter-version-summary/search/parameter-version-summary-search.component';
import { EndTrialSearchComponent } from './views/dacs/parameter-trial/end-trial/search/end-trial-search.component';
import { AdhocReportsComponent } from '@views/dacs/adhoc-reports/search/adhoc-reports-search.component';
import { DagwParameterSummaryComponent } from './views/dacs/parameter-management/dagw-parameter-summary/dagw-parameter-summary.component';
import { ParameterViewerComponent } from './views/dacs/parameter-management/parameter-viewer/parameter-viewer.component';
import { SystemParametersComponent } from './views/dacs/parameter-management/parameter-viewer/system-parameters/system-parameters.component';
import { ParameterFileImportComponent } from './views/dacs/parameter-management/parameter-file-import/parameter-file-import.component';
import { ParameterFileExportComponent } from './views/dacs/parameter-management/parameter-file-export/parameter-file-export.component';
import { DiagnosticsComponent } from './views/dacs/maintenance/diagnostics/diagnostics.component';
import { MaintenanceComponent } from './views/dacs/maintenance/maintenance.component';
import { EodProcessComponent } from './views/dacs/maintenance/eod-process/eod-process.component';
import { AuditLogComponent } from './views/dacs/maintenance/audit-log/audit-log.component';
import { SystemInformationComponent } from './views/dacs/maintenance/system-information/system-information.component';
import { NotificationComponent } from './components/notification/notification.component';
import { DataListComponent } from './components/data-list/data-list.component';
import { NotificationListComponent } from './components/notification/notification-list/notification-list.component';
import { EventHistoryComponent } from './components/layout/footer/event-history/event-history.component';

export const dacsRoutes = {
  dashboard: {
    home: 'dashboard',
    depotOverView: 'dashboard/:id',
  },
  user: 'user',
  monitoring: {
    busOperation: 'bus-operation',
    cardKeyVersion: 'card-key-version',
  },
  bus: {
    busExpList: 'bus-exception-list',
    busList: 'bus-list',
    vehicleList: 'vehicle-list',
    busTransfer: 'bus-transfer',
  },
  report: {
    dailyReport: 'report/daily-report',
    adhoc: 'report/adhoc',
  },
  parameterManagement: {
    url: 'parameter-management',
    dagwParameter: 'dagw-parameter',
    parameterViewer: 'parameter-viewer',
    importParameter: 'import-parameter',
    exportParameter: 'export-parameter',
  },
  maintenance: {
    url: 'maintenance',
    diagnostics: 'maintenance/diagnostics',
    eodProcess: 'maintenance/eod-process',
    auditLog: 'maintenance/audit-log',
    systemInformation: 'maintenance/system-information',
  },
  parameterTrial: {
    url: 'parameter-trial',
    approval: 'parameter-trial/approval',
    parameterMode: 'parameter-trial/parameter-mode',
    trialDeviceSelection: 'parameter-trial/trial-device-selection',
    parameterVersionSummary: 'parameter-trial/parameter-version-summary',
    endTrial: 'parameter-trial/end-trial',
  },
  notification: 'notification-centre',
  eventHistory: 'event-history',
};

export const dawgRoutes = {
  dashboard: 'dashboard',
  user: 'user',
  busMonitoring: 'bus-monitoring',
  bus: {
    busExpList: 'bus-exception-list',
    busList: 'bus-list',
    vehicleList: 'vehicle-list',
    busTransfer: 'bus-transfer',
  },
  report: {
    dailyReport: 'report/daily-report',
    adhoc: 'report/adhoc',
  },
  parameterManagement: {
    url: 'parameter-management',
    dawgParameter: 'dawg-parameter',
    parameterViewer: 'parameter-viewer',
    importParameter: 'import-parameter',
    exportParameter: 'export-parameter',
    messageFileImport: 'message-file-import',
    messageFileExport: 'message-file-export',
  },
  parameterTrial: {
    url: 'parameter-trial',
    approval: 'parameter-trial/approval',
    parameterMode: 'parameter-trial/parameter-mode',
    trialDeviceSelection: 'parameter-trial/trial-device-selection',
    parameterVersionSummary: 'parameter-trial/parameter-version-summary',
    endTrial: 'parameter-trial/end-trial',
  },
};

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'sign-in',
    pathMatch: 'full',
  },
  {
    path: 'sign-in',
    component: SignInComponent,
  },
  {
    path: 'dacs',
    component: LayoutComponent,
    canActivate: [AuthGuard, MdcsGuard],
    children: [
      {
        path: dacsRoutes?.dashboard?.home,
        loadComponent: () =>
          import('./views/dacs/dashboard/home/home.component').then(
            m => m.HomeComponent
          ),
      },
      {
        path: dacsRoutes?.dashboard?.depotOverView,
        component: DepotOverViewComponent,
      },
      {
        path: dacsRoutes?.user,
        component: UserViewComponent,
      },
      {
        path: dacsRoutes?.monitoring?.busOperation,
        component: BusOperationSearchComponent,
      },
      {
        path: dacsRoutes?.monitoring?.cardKeyVersion,
        component: ViewCardKeyVersionComponent,
      },
      {
        path: dacsRoutes?.bus?.busExpList,
        component: BusExceptionListSearchComponent,
      },
      {
        path: dacsRoutes?.bus?.busList,
        component: BusSearchComponent,
      },
      {
        path: dacsRoutes?.bus?.vehicleList,
        component: VehicleSearchComponent,
      },
      {
        path: dacsRoutes?.bus?.busTransfer,
        component: BusTransferSearchComponent,
      },
      {
        path: dacsRoutes?.report?.dailyReport,
        component: DailyReportComponent,
      },
      {
        path: dacsRoutes?.report?.adhoc,
        component: AdhocReportsComponent,
      },
      {
        path: dacsRoutes?.parameterTrial?.approval,
        component: NewParameterApprovalSearchComponent,
      },
      {
        path: dacsRoutes?.parameterTrial?.parameterMode,
        component: ParameterModeSearchComponent,
      },
      {
        path: dacsRoutes?.parameterTrial?.trialDeviceSelection,
        component: TrialDeviceSelectionSearchComponent,
      },
      {
        path: dacsRoutes?.parameterTrial?.parameterVersionSummary,
        component: ParameterVersionSummarySearchComponent,
      },
      {
        path: dacsRoutes?.parameterTrial?.endTrial,
        component: EndTrialSearchComponent,
      },
      {
        path: dacsRoutes?.parameterManagement?.dagwParameter,
        component: DagwParameterSummaryComponent,
      },
      {
        path: dacsRoutes?.parameterManagement?.parameterViewer,
        component: ParameterViewerComponent,
      },
      {
        path: dacsRoutes?.parameterManagement?.importParameter,
        component: ParameterFileImportComponent,
      },
      {
        path: dacsRoutes?.parameterManagement?.exportParameter,
        component: ParameterFileExportComponent,
      },
      {
        path: '',
        component: MaintenanceComponent,
        children: [
          {
            path: dacsRoutes?.maintenance?.diagnostics,
            component: DiagnosticsComponent,
          },
          {
            path: dacsRoutes?.maintenance?.eodProcess,
            component: EodProcessComponent,
          },
          {
            path: dacsRoutes?.maintenance?.systemInformation,
            component: SystemInformationComponent,
          },
        ],
      },
      {
        path: dacsRoutes?.maintenance?.auditLog,
        component: AuditLogComponent,
      },
      {
        path: dacsRoutes?.notification,
        component: NotificationListComponent,
      },
      {
        path: dacsRoutes?.eventHistory,
        component: EventHistoryComponent,
      },
    ],
  },
  {
    path: 'dagw',
    component: LayoutComponent,
    canActivate: [AuthGuard, DagwGuard],
    children: [
      {
        path: dawgRoutes.dashboard,
        component: DagwDashboardComponent,
      },
      {
        path: dawgRoutes.busMonitoring,
        loadComponent: () =>
          import(
            './views/dagw/monitoring/bus-operation/bus-operation-search.component'
          ).then(m => m.BusOperationSearchComponent),
      },
      {
        path: dawgRoutes.bus.vehicleList,
        loadComponent: () =>
          import(
            './views/dacs/bus/vehicle/search/vehicle-search.component'
          ).then(m => m.VehicleSearchComponent),
      },
      {
        path: dawgRoutes?.report?.dailyReport,
        loadComponent: () =>
          import(
            './views/dagw/daily-report/search/daily-report-search.component'
          ).then(m => m.DailyReportComponent),
      },
      {
        path: dawgRoutes?.parameterManagement?.importParameter,
        loadComponent: () =>
          import(
            './views/dagw/parameter-management/parameter-file-import/parameter-file-import.component'
          ).then(m => m.ParameterFileImportComponent),
      },
      {
        path: dawgRoutes?.parameterManagement?.exportParameter,
        loadComponent: () =>
          import(
            './views/dagw/parameter-management/parameter-file-export/parameter-file-export.component'
          ).then(m => m.ParameterFileExportComponent),
      },
      {
        path: dawgRoutes?.parameterManagement?.messageFileImport,
        loadComponent: () =>
          import(
            './views/dagw/parameter-management/message-file-import/message-file-import.component'
          ).then(m => m.MessageFileImportComponent),
      },
      {
        path: dawgRoutes?.parameterManagement?.messageFileExport,
        loadComponent: () =>
          import(
            './views/dagw/parameter-management/message-file-export/message-file-export.component'
          ).then(m => m.MessageFileExportComponent),
      },
    ],
  },
];
