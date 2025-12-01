import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { AuthGuard } from './guards/auth.guard';
import { DagwGuard, MdcsGuard } from './guards/dagw.guard';
import { BusExceptionListSearchComponent } from './views/dacs/bus/bus-exception-list/bus-exception-list-search.component';
import { BusSearchComponent } from './views/dacs/bus/daily-bus-list/search/bus-search.component';
import { DepotOverViewComponent } from './views/dacs/dashboard/depot-over-view/depot-over-view.component';
import { DagwDashboardComponent } from './views/dagw/dagw-dashboard/dagw-dashboard.component';
import { SignInComponent } from './views/sign-in/sign-in.component';
import { UserViewComponent } from './views/user/user-view/user-view.component';

import { BusTransferSearchComponent } from './views/dacs/bus/bus-transfer/search/bus-transfer-search.component';
import { VehicleSearchComponent } from './views/dacs/bus/vehicle/search/vehicle-search.component';
import { BusOperationSearchComponent } from './views/dacs/monitoring/bus-operation/bus-operation-search.component';
import { ViewCardKeyVersionComponent } from './views/dacs/monitoring/card-key-version/card-key-version.component';

import { EventHistoryComponent } from './components/layout/footer/event-history/event-history.component';
import { NotificationListComponent } from './components/notification/notification-list/notification-list.component';
import { AuditLogComponent } from './views/dacs/maintenance/audit-log/audit-log.component';
import { DiagnosticsComponent } from './views/dacs/maintenance/diagnostics/diagnostics.component';
import { EodProcessComponent } from './views/dacs/maintenance/eod-process/eod-process.component';
import { MaintenanceComponent } from './views/dacs/maintenance/maintenance.component';
import { SystemInformationComponent } from './views/dacs/maintenance/system-information/system-information.component';
import { DagwParameterSummaryComponent } from './views/dacs/parameter-management/dagw-parameter-summary/dagw-parameter-summary.component';
import { ParameterFileExportComponent } from './views/dacs/parameter-management/parameter-file-export/parameter-file-export.component';
import { ParameterFileImportComponent } from './views/dacs/parameter-management/parameter-file-import/parameter-file-import.component';
import { ParameterViewerComponent } from './views/dacs/parameter-management/parameter-viewer/parameter-viewer.component';
import { EndTrialSearchComponent } from './views/dacs/parameter-trial/end-trial/search/end-trial-search.component';
import { NewParameterApprovalSearchComponent } from './views/dacs/parameter-trial/new-parameter-approval/search/new-parameter-approval-search.component';
import { ParameterModeSearchComponent } from './views/dacs/parameter-trial/parameter-mode/search/parameter-mode-search.component';
import { ParameterVersionSummarySearchComponent } from './views/dacs/parameter-trial/parameter-version-summary/search/parameter-version-summary-search.component';
import { TrialDeviceSelectionSearchComponent } from './views/dacs/parameter-trial/trial-device-selection/search/trial-device-selection-search.component';
import { AdHocComponent } from './views/dacs/report/ad-hoc/ad-hoc.component';
import { BusArrivalExceptionListComponent } from './views/dacs/report/pages/bus-arrival-exception-list/bus-arrival-exception-list.component';
import { BusListAuditTrialComponent } from './views/dacs/report/pages/bus-list-audit-trial/bus-list-audit-trial.component';
import { BusPartialUploadComponent } from './views/dacs/report/pages/bus-partial-upload/bus-partial-upload.component';
import { DagwMonthlyReportComponent } from './views/dacs/report/pages/dagw-monthly-report/dagw-monthly-report.component';
import { DailyBusListReportComponent } from './views/dacs/report/pages/daily-bus-list-report/daily-bus-list-report.component';
import { BusTransferReportComponent } from './views/dacs/report/pages/bus-transfer-report/bus-transfer-report.component';
import { AllDailyReportComponent } from './views/dacs/report/pages/all-daily-report/all-daily-report.component';
import { DailyReportComponent } from './views/dacs/report/daily-report/daily-report.component';

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
    dailyReport: {
      url: 'report/daily-report',
      allDailyReport: 'report/daily-report/all-daily-report',
      busArrival: 'report/daily-report/bus-arrival-exception-list',
      busAuditTrial: 'report/daily-report/bus-list-audit-trial',
      busPartialUploadReport: 'report/daily-report/bus-partial-upload-report',
      busTransferReport: 'report/daily-report/bus-transfer-report',
      dailyBusListReport: 'report/daily-report/daily-bus-list-report',
      dagwMonthlyReport: 'report/daily-report/dagw-monthly-availability-report',
    },
    adhoc: {
      url: 'report/adhoc',
      busArrival: 'report/adhoc/bus-arrival-exception-list',
      busAuditTrial: 'report/adhoc/bus-list-audit-trial',
      busPartialUploadReport: 'report/adhoc/bus-partial-upload-report',
      busTransferReport: 'report/adhoc/bus-transfer-report',
      dailyBusListReport: 'report/adhoc/daily-bus-list-report',
      dagwMonthlyReport: 'report/adhoc/dagw-monthly-availability-report',
    },
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
  busMonitoring: {
    busOperation: 'bus-operation',
    vehicleList: 'vehicle-list',
  },
  parameterTrialManagement: {
    dagwParameter: 'dagw-parameter',
    importParameter: 'import-parameter',
    exportParameter: 'export-parameter',
    trialDeviceSelection: 'parameter-trial/trial-device-selection',
  },
  messageDataManagement: {
    messageFileImport: 'message-file-import',
    messageFileExport: 'message-file-export',
  },
  report: {
    busArrival: 'report/daily-report/bus-arrival-exception-list',
  },
  maintenance: {
    url: 'maintenance',
    diagnostics: 'maintenance/diagnostics',
    eodProcess: 'maintenance/eod-process',
    auditLog: 'maintenance/audit-log',
    systemInformation: 'maintenance/system-information',
  },
  notification: 'notification-centre',
  eventHistory: 'event-history',
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
        path: '',
        component: AdHocComponent,
        children: [
          {
            path: dacsRoutes?.report?.adhoc?.busArrival,
            component: BusArrivalExceptionListComponent,
          },
          {
            path: dacsRoutes?.report?.adhoc?.busAuditTrial,
            component: BusListAuditTrialComponent,
          },
          {
            path: dacsRoutes?.report?.adhoc?.busPartialUploadReport,
            component: BusPartialUploadComponent,
          },
          {
            path: dacsRoutes?.report?.adhoc?.busTransferReport,
            component: BusTransferReportComponent,
          },
          {
            path: dacsRoutes?.report?.adhoc?.dailyBusListReport,
            component: DailyBusListReportComponent,
          },
          {
            path: dacsRoutes?.report?.adhoc?.dagwMonthlyReport,
            component: DagwMonthlyReportComponent,
          },
        ],
      },
      {
        path: '',
        component: DailyReportComponent,
        children: [
          {
            path: dacsRoutes?.report?.dailyReport?.allDailyReport,
            component: AllDailyReportComponent,
          },
          {
            path: dacsRoutes?.report?.dailyReport?.busArrival,
            component: BusArrivalExceptionListComponent,
          },
          {
            path: dacsRoutes?.report?.dailyReport?.busAuditTrial,
            component: BusListAuditTrialComponent,
          },
          {
            path: dacsRoutes?.report?.dailyReport?.busPartialUploadReport,
            component: BusPartialUploadComponent,
          },
          {
            path: dacsRoutes?.report?.dailyReport?.busTransferReport,
            component: BusTransferReportComponent,
          },
          {
            path: dacsRoutes?.report?.dailyReport?.dailyBusListReport,
            component: DailyBusListReportComponent,
          },
          {
            path: dacsRoutes?.report?.dailyReport?.dagwMonthlyReport,
            component: DagwMonthlyReportComponent,
          },
        ],
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
      // {
      //   path: '',
      //   component: MaintenanceComponent,
      //   children: [
      //     // {
      //     //   path: dacsRoutes?.maintenance?.diagnostics,
      //     //   component: DiagnosticsComponent,
      //     // },
      //     // {
      //     //   path: dacsRoutes?.maintenance?.eodProcess,
      //     //   component: EodProcessComponent,
      //     // },
      //     {
      //       path: dacsRoutes?.maintenance?.systemInformation,
      //       component: SystemInformationComponent,
      //     },
      //   ],
      // },
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
        path: dawgRoutes.busMonitoring.busOperation,
        loadComponent: () =>
          import(
            './views/dagw/bus-monitoring/bus-operation/bus-operation-search.component'
          ).then(m => m.BusOperationSearchComponent),
      },
      {
        path: dawgRoutes.busMonitoring.vehicleList,
        loadComponent: () =>
          import(
            './views/dagw/bus-monitoring/vehicle/search/vehicle-search.component'
          ).then(m => m.VehicleSearchComponent),
      },
      {
        path: dawgRoutes?.parameterTrialManagement?.dagwParameter,
        loadComponent: () =>
          import(
            './views/dagw/parameter-trial-management/dagw-parameter-summary/dagw-parameter-summary.component'
          ).then(m => m.DagwParameterSummaryComponent),
      },
      {
        path: dawgRoutes?.parameterTrialManagement?.importParameter,
        loadComponent: () =>
          import(
            './views/dagw/parameter-trial-management/parameter-file-import/parameter-file-import.component'
          ).then(m => m.ParameterFileImportComponent),
      },
      {
        path: dawgRoutes?.parameterTrialManagement.exportParameter,
        loadComponent: () =>
          import(
            './views/dagw/parameter-trial-management/parameter-file-export/parameter-file-export.component'
          ).then(m => m.ParameterFileExportComponent),
      },
      {
        path: dawgRoutes?.parameterTrialManagement.trialDeviceSelection,
        loadComponent: () =>
          import(
            './views/dagw/parameter-trial-management/trial-device-selection/search/trial-device-selection-search.component'
          ).then(m => m.TrialDeviceSelectionSearchComponent),
      },
      {
        path: dawgRoutes?.messageDataManagement?.messageFileImport,
        loadComponent: () =>
          import(
            './views/dagw/message-data-management/message-file-import/message-file-import.component'
          ).then(m => m.MessageFileImportComponent),
      },
      {
        path: dawgRoutes?.messageDataManagement?.messageFileExport,
        loadComponent: () =>
          import(
            './views/dagw/message-data-management/message-file-export/message-file-export.component'
          ).then(m => m.MessageFileExportComponent),
      },
      {
        path: dawgRoutes?.report?.busArrival,
        loadComponent: () =>
          import(
            './views/dagw/report/bus-arrival-exception-list/bus-arrival-exception-list.component'
          ).then(m => m.BusArrivalExceptionListComponent),
      },
      {
        path: dawgRoutes?.maintenance?.diagnostics,
        loadComponent: () =>
          import(
            './views/dagw/maintenance/diagnostics/diagnostics.component'
          ).then(m => m.DiagnosticsComponent),
      },
      {
        path: dawgRoutes?.maintenance?.eodProcess,
        loadComponent: () =>
          import(
            './views/dagw/maintenance/eod-process/eod-process.component'
          ).then(m => m.EodProcessComponent),
      },
      {
        path: dawgRoutes?.maintenance?.systemInformation,
        loadComponent: () =>
          import(
            './views/dagw/maintenance/system-information/system-information.component'
          ).then(m => m.SystemInformationComponent),
      },
      {
        path: dawgRoutes?.maintenance?.auditLog,
        loadComponent: () =>
          import('./views/dagw/maintenance/audit-log/audit-log.component').then(
            m => m.AuditLogComponent
          ),
      },
      {
        path: dawgRoutes?.notification,
        loadComponent: () =>
          import(
            './components/notification/notification-list/notification-list.component'
          ).then(m => m.NotificationListComponent),
      },
      {
        path: dawgRoutes?.eventHistory,
        loadComponent: () =>
          import(
            './components/layout/footer/event-history/event-history.component'
          ).then(m => m.EventHistoryComponent),
      },
    ],
  },
];
