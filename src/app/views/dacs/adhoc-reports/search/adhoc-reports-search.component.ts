import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import {
  MatOptionModule,
  provideNativeDateAdapter, 
} from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MatCheckboxModule,
} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { FilterComponent } from '@app/components/filter/filter.component';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { SSRSReportViewerComponent } from '@app/components/ssrs-reportviewer/ssrs-reportviewer.component';
import { BreadcrumbsComponent } from '@components/layout/breadcrumbs/breadcrumbs.component';
import {
  DropdownList,
  IReportParameter,
  IReportViewerOption,
} from '@models/common';
import { IDepoList } from '@models/depo';
import { TabList } from '@models/tab-list';
import { DepoService } from '@services/depo.service';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { AuthService } from '@app/services/auth.service';

export const tabsKeys = {
  bus_arrival_exception_list: 'bus_arrival_exception_list',
  bus_list_audit_trail: 'bus_list_audit_trail',
  bus_partial_upload: 'bus_partial_upload',
  daily_bus_list: 'daily_bus_list',
  bus_transfer: 'bus_transfer',
  DAGW_monthly_availability: 'DAGW_monthly_availability',
};

export interface MonthList {
  month_name: string,
  month_value: string,
}

@Component({
  selector: 'app-adhoc-reports',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    MatTableModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatOptionModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatTabsModule,
    RouterModule,
    MatCheckboxModule,
    MatSortModule,
    MatMenuModule,
    CommonModule,
    MatDividerModule,
    FormsModule,
    FilterComponent,
    PaginationComponent,
    SelectedFilterComponent,
    SSRSReportViewerComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './adhoc-reports-search.component.html',
  styleUrl: './adhoc-reports-search.component.scss',
})
export class AdhocReportsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  tabList: TabList[] = [
    {
      key: tabsKeys?.bus_arrival_exception_list,
      title: 'Bus Arrival Exception List',
    },
    {
      key: tabsKeys?.bus_list_audit_trail,
      title: 'Bus List Audit Trail',
    },
    {
      key: tabsKeys?.bus_partial_upload,
      title: 'Bus Partial Upload',
    },
    {
      key: tabsKeys?.daily_bus_list,
      title: 'Daily Bus List',
    },
    {
      key: tabsKeys?.bus_transfer,
      title: 'Bus Transfer',
    },
    {
      key: tabsKeys?.DAGW_monthly_availability,
      title: 'DAGW Monthly Availability',
    },
  ];

  today: string;

  depots: IDepoList[] = [];
  report_type: string = 'bus_arrival_exception_list';

  months: MonthList[] = [];

  depotSelected: string = '';
  businessDaySelected: string = '';
  monthSelected: string = '';

  reportName: string = "BusArrivalExceptionReport";
  parameterReportViewer: IReportParameter = {
    spid: null,
    businessday: null,
    depotid: null,
    month: null,
    user: null,
  };
  optionReportViewer: IReportViewerOption = {
    showparameter: "false",
    toolbar: "true"
  };

  svcProviderID = this.authService.getSVCProvider();

  isButtonClick: boolean = false;

  constructor(
    private depoService: DepoService,
    public dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.today = new Date().toISOString().split('T')[0];
    this.subscribeDepot();
    
    this.months = this.getMonthValue(new Date);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTabChange(event: MatTabChangeEvent) {
    this.report_type = event.tab.textLabel;

    this.depotSelected = '';
    this.businessDaySelected = '';
    this.monthSelected = '';
    this.parameterReportViewer = {
      spid: this.svcProviderID,
      businessday: null,
      depotid: null,
      month: null,
      user: null,
    };

    this.changeReport(this.report_type);
  }

  getMonthValue(month: Date): MonthList[] {
    const months: MonthList[] = [];
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    for (let i = 0; i <= 2; i++) {
      months.push({
        month_name: monthNames[month.getMonth()-i] + ' ' + month.getFullYear(),
        month_value: i.toString(),
      });
    }
    return months;
  }

  changeReport(report_type: string) {
    switch (report_type) {
      case 'bus_arrival_exception_list':
        this.reportName = "BusArrivalExceptionReport"
        break;
      case 'bus_list_audit_trail':
        this.reportName = "BusAuditTrailReport"
        break;
      case 'bus_partial_upload':
        this.reportName = "BusPartialUploadReport"
        break;
      case 'daily_bus_list':
        this.reportName = "DailyBusListReport"
        break;
      case 'bus_transfer':
        this.reportName = "BusTransferReport"
        break;
      case 'DAGW_monthly_availability':
        this.reportName = "DAGWMontlyAvailability"
        break;
      default:
        this.reportName = "BusArrivalExceptionReport";
    }
  }

  subscribeDepot(): void {
    const depotList$ = this.depoService.depoList$;
    combineLatest([depotList$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([depotList]) => {
        this.depots = depotList;
      });
  }

  onViewReport() {
    this.parameterReportViewer = {
      spid: this.svcProviderID,
      businessday: this.today || this.parameterReportViewer.businessday,
      depotid: this.depotSelected || this.parameterReportViewer.depotid,
      user: 'LTA\\Supervisor',
      month: this.monthSelected || this.parameterReportViewer.month,
    };
    if(this.parameterReportViewer.depotid != null) {
      this.isButtonClick = true;
    }
  }

  isIframeLoadedEvent(newValue: boolean) {
    this.isButtonClick = !newValue;
  }

  formatDate(currentDate: string) {
    const date = new Date(currentDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
