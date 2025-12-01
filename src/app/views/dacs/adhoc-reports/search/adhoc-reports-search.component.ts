import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { FilterComponent } from '@app/components/filter/filter.component';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { IAdhocReport } from '@app/models/adhoc-report-list';
import { FilterService } from '@app/services/filter.service';
import {
  busTransferFilterValues,
  dagwFilterValues,
  defaultFilterValues,
  loadFilterValues,
  reusableFilterValues,
} from '@app/shared/utils/filter-config';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import { DownloadDialogComponent } from '@components/download-dialog/download-dialog.component';
import { BreadcrumbsComponent } from '@components/layout/breadcrumbs/breadcrumbs.component';
import TableHeader from '@data/adhoc-report.json';
import {
  DailyReportRequest,
  DropdownList,
  IHeader,
  PayloadResponse,
} from '@models/common';
import { IDepoList } from '@models/depo';
import { TabList } from '@models/tab-list';
import {
  VehicleStatusEnum,
  VehicleStatusLabelMapping,
} from '@models/vehicle-list';
import { AdhocReportService } from '@services/adhoc-report.service';
import { DepoService } from '@services/depo.service';
import { combineLatest, Subject, takeUntil } from 'rxjs';

export const tabsKeys = {
  all: 'all',
  bus_arrival_exception_list: 'bus_arrival_exception_list',
  bus_list_audit_trail: 'bus_list_audit_trail',
  bus_partial_upload: 'bus_partial_upload',
  daily_bus_list: 'daily_bus_list',
  bus_transfer: 'bus_transfer',
  DAGW_monthly_availability: 'DAGW_monthly_availability',
};

@Component({
    selector: 'app-adhoc-reports',
    imports: [
        BreadcrumbsComponent,
        MatTableModule,
        MatCardModule,
        MatButtonModule,
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
    ],
    providers: [MatDatepickerModule],
    templateUrl: './adhoc-reports-search.component.html',
    styleUrl: './adhoc-reports-search.component.scss'
})
export class AdhocReportsComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();

  headerData = TableHeader;
  displayedColumns: string[] = TableHeader.map((x: IHeader) => {
    return x.field;
  });
  rowCount: number = 0;
  options: DropdownList[] = [];
  statusOptions: DropdownList[] = Object.values(VehicleStatusEnum).map(_s => ({
    id: _s,
    value: VehicleStatusLabelMapping[_s],
  }));
  depots: IDepoList[] = [];

  dataSource: IAdhocReport[] = [];
  selection: IAdhocReport[] = [];

  params: DailyReportRequest = {
    page_size: 5,
    page_index: 0,
    sort_order: [],
    business_date: '',
    depot_id: '',
    report_type: tabsKeys?.all,
  };
  chkAll: boolean = false;
  pageSize: number;
  initChkGroup = {
    service_provider_name: [],
    depot_name: [],
    report_type: [],
  };
  chkGroup: { [key: string]: any[] } = this.initChkGroup;
  headerTabs: { [key: string]: string[] } = {
    all: ['service_provider_name', 'report_type'],
    bus_arrival_exception_list: ['service_provider_name', 'report_type'],
    bus_list_audit_trail: ['service_provider_name', 'report_type'],
    bus_partial_upload: ['service_provider_name', 'report_type'],
    daily_bus_list: ['service_provider_name', 'report_type'],
    bus_transfer: [
      'current_operator',
      'future_operator',
      'start_date',
      'end_date',
    ],
    DAGW_monthly_availability: ['month_type'],
  };
  tabList: TabList[] = [
    {
      key: tabsKeys?.all,
      title: 'All',
    },
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

  reportTypes: DropdownList[] = [
    {
      id: '1',
      value: 'Bus Arrival Exception List',
    },
    {
      id: '2',
      value: 'Bus Partial Upload',
    },
    {
      id: '3',
      value: 'Daily Bus List',
    },
    {
      id: '4',
      value: 'Bus List Audit Trail',
    },
    {
      id: '5',
      value: 'Bus Data Transfer',
    },
  ];

  serviceProvideList: DropdownList[] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  services: any = [];

  filterConfigs: IFilterConfig[] = [];
  selectedTabIndex: number = 0;
  expandedMenu: boolean = false;

  constructor(
    private adhocReportService: AdhocReportService,
    private depoService: DepoService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private filterService: FilterService
  ) {}

  ngOnInit() {
    this.initializeFilters();
  }

  ngAfterViewInit(): void {
    this.loadDefaultFilterValues();
  }

  ngOnDestroy() {
    this.services.forEach((service: { cleanup: () => void }) => {
      if (typeof service.cleanup === 'function') {
        service.cleanup();
      }
    });

    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFilters(): void {
    combineLatest([
      this.depoService.depo$,
      this.depoService.depoList$,
      this.adhocReportService.getServiceProvider(),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([depotId, depots, serviceProviders]) => {
        this.depots = depots;
        this.serviceProvideList = serviceProviders.payload;

        this.params.depot_id = depotId;

        this.filterService.updateFilterConfigs(
          loadFilterValues(
            this.depots,
            this.reportTypes,
            this.serviceProvideList
          )
        );

        this.reloadHandler();
      });

    this.filterService.filterConfigs$
      .pipe(takeUntil(this.destroy$))
      .subscribe(configs => (this.filterConfigs = configs));
  }

  private loadDefaultFilterValues(): void {
    this.filterService.updateFilterConfigs(
      defaultFilterValues(
        this.depots,
        this.reportTypes,
        this.serviceProvideList
      )
    );
    this.cdr.detectChanges();
  }

  subscribeToDepoChanges(): void {
    this.depoService.depo$
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: string) => {
        this.params.depot_id = value;
        this.reloadHandler();
      });

    this.depoService?.depoList$?.pipe(takeUntil(this.destroy$)).subscribe({
      next: (val: IDepoList[]) => (this.depots = val),
    });
  }

  reloadHandler() {
    this.adhocReportService
      .search(this.params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value: PayloadResponse) => {
          if (value.status == 200) {
            this.dataSource = value.payload['adhoc-reports'];
            this.selection = [];
            this.chkAll = false;
          }
        },
      });
  }

  onTabChange(event: MatTabChangeEvent) {
    this.params.report_type = event.tab.textLabel;

    this.filterService.clearSelectedFilters();
    this.updateFilterConfigsBasedOnType(this.params.report_type);

    this.reloadHandler();
  }

  checkHandler(event: MatCheckboxChange, element: IAdhocReport) {
    this.selection = event.checked
      ? [...this.selection, element]
      : this.selection.filter(x => x.id !== element.id);
  }

  checkAllHandler(event: MatCheckboxChange): void {
    this.chkAll = event.checked;
    this.dataSource.forEach(x => (x.chk = event.checked));

    if (event.checked) {
      this.selectAllItems();
    } else {
      this.selection = [];
    }
  }

  selectAllItems(): void {
    const originalPageSize = this.params.page_size;
    this.params.page_size = 9999;

    if (this.params.depot_id) {
      this.adhocReportService
        .search(this.params)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (value: PayloadResponse) => {
            if (value.status == 200) {
              this.params.page_size = originalPageSize;
              const source = value.payload['adhoc-reports'];
              this.selection = source;
            }
          },
        });
    }
  }

  private updateFilterConfigsBasedOnType(reportType: string) {
    let filterConfigs: IFilterConfig[] = [];

    switch (reportType) {
      case tabsKeys.all: {
        filterConfigs = defaultFilterValues(
          this.depots,
          this.reportTypes,
          this.serviceProvideList
        );
        break;
      }
      case tabsKeys.DAGW_monthly_availability: {
        filterConfigs = dagwFilterValues(this.depots);
        break;
      }
      case tabsKeys.bus_transfer: {
        filterConfigs = busTransferFilterValues(this.depots);
        break;
      }
      default: {
        filterConfigs = reusableFilterValues(
          this.depots,
          this.serviceProvideList
        );
        break;
      }
    }

    this.filterService.updateFilterConfigs(filterConfigs);
    this.cdr.detectChanges();
  }

  hiddenHandler(element: any) {
    return this.headerTabs[this.params.report_type]?.includes(element);
  }

  sortHandler(element: Sort) {
    this.params.sort_order = [
      { name: element.active, desc: element.direction == 'asc' ? false : true },
    ];
    this.reloadHandler();
  }

  menuHandler(isOpen: boolean) {
    this.expandedMenu = isOpen;
  }

  downloadHandler() {
    this.dialog.open(DownloadDialogComponent, {
      width: '100%',
      height: '100%',
      maxHeight: '266px',
      maxWidth: '420px',
      panelClass: ['download-dialog'],
      autoFocus: 'first-heading',
      disableClose: true,
      data: {
        progress: '100',
        totol: '100',
      },
    });
  }
}
