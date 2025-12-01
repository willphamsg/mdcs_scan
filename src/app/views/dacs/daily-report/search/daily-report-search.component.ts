import { OverlayContainer } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
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
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { FilterComponent } from '@app/components/filter/filter.component';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { IReportList } from '@app/models/daily-report';
import { FilterService } from '@app/services/filter.service';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import { DownloadDialogComponent } from '@components/download-dialog/download-dialog.component';
import { BreadcrumbsComponent } from '@components/layout/breadcrumbs/breadcrumbs.component';
import TableHeader from '@data/daily-report-header.json';
import {
  DailyReportRequest,
  DropdownList,
  IHeader,
  IParams,
  PayloadResponse,
} from '@models/common';
import { IDepoList } from '@models/depo';
import { TabList } from '@models/tab-list';
import { IVehicleDelete, IVehicleList } from '@models/vehicle-list';
import { DailyReportService } from '@services/daily-report.service';
import { DepoService } from '@services/depo.service';
import { combineLatest, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-daily-report',
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
    templateUrl: './daily-report-search.component.html',
    styleUrl: './daily-report-search.component.scss'
})
export class DailyReportComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();

  headerData = TableHeader;
  displayedColumns: string[] = TableHeader.map((x: IHeader) => {
    return x.field;
  });
  rowCount: number = 0;
  searchForm: FormGroup;
  options: DropdownList[] = [];
  depots: IDepoList[] = [];

  dataSource: IReportList[] = [];
  selection: IReportList[] = [];

  // params: DailyReportRequest = {
  //   page_size: 5,
  //   page_index: 0,
  //   sort_order: [],
  //   business_date: '',
  //   depot_id: '',
  //   report_type: 'All',
  // };

  params: IParams = {
    page_size: 10,
    page_index: 0,
    sort_order: [],
    search_text: '',
    search_select_filter: {},
  };

  chkAll: boolean = false;
  pageSize: number;
  chkGroup: { [key: string]: boolean } = {};
  tabList: TabList[] = [
    {
      key: 'all',
      title: 'All',
    },
    {
      key: 'busArrivalExceptionList',
      title: 'Bus Arrival Exception List',
    },
    {
      key: 'busListAuditTrail',
      title: 'Bus List Audit Trail',
    },
    {
      key: 'busTransferReport',
      title: 'Bus Transfer Report',
    },
    {
      key: 'busPartialUploadReport',
      title: 'Bus Partial Upload Report',
    },
    {
      key: 'dailyBusListReport',
      title: 'Daily Bus List Report',
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
  expandedMenu: boolean = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  filterConfigs: IFilterConfig[] = [];

  constructor(
    private dailyReportService: DailyReportService,
    private depoService: DepoService,
    public dialog: MatDialog,
    private filterService: FilterService
  ) {}

  ngOnInit() {
    this.subscribeToDepoChanges();
    this.loadFilterValues();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  subscribeToDepoChanges(): void {
    const depot$ = this.depoService.depo$;
    const depotList$ = this.depoService.depoList$;

    combineLatest([depot$, depotList$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([depoValue, depotList]) => {
        // this.params.depot_id = depoValue;
        this.depots = depotList;
        this.reloadHandler();
      });
  }

  loadFilterValues(): void {
    this.filterConfigs = [
      {
        controlName: 'reportType',
        value: [],
        type: 'array',
        options: this.reportTypes,
      },
      {
        controlName: 'depots',
        value: [],
        type: 'array',
        options: this.depots,
      },
      {
        controlName: 'businessDate',
        type: 'date-picker',
        value: '',
      },
    ];
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

  reloadHandler(): void {
    // if (this.params.depot_id) {
      this.fetchDailyReportList();
    // }
  }

  fetchDailyReportList(): void {
    this.dailyReportService
      .search(this.params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value: PayloadResponse) => {
          if (value.status == 200) {
            this.dataSource = value.payload['daily-report'];
            this.selection = [];
            this.chkAll = false;
          }
        },
      });
  }

  checkHandler(event: MatCheckboxChange, element: IReportList) {
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

    // if (this.params.depot_id) {
      this.dailyReportService.search(this.params).subscribe({
        next: (value: PayloadResponse) => {
          if (value.status == 200) {
            this.params.page_size = originalPageSize;
            const source = value.payload['daily-report'];
            this.selection = source.map((item: IReportList) => {
              return <IReportList>item;
            });
          }
        },
      });
    // }
  }

  onTabChange(event: MatTabChangeEvent) {
    this.filterService.clearSelectedFilters();
    // this.params.report_type = event.tab.textLabel;
    this.reloadHandler();
  }

  hiddenHandler(element: string) {
    return this.headerData.filter(x => x.field == element)[0].chk;
  }

  sortHandler(element: Sort) {
    this.params.sort_order = [
      { name: element.active, desc: element.direction == 'asc' ? false : true },
    ];
    this.reloadHandler();
  }
}
