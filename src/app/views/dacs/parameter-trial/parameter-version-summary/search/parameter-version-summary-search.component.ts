import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

import { RouterModule } from '@angular/router';
import {
  BusRequest,
  DropdownList,
  IHeader,
  PayloadResponse,
  IParams,
  IPaginationEvent,
} from '@models/common';
import { PaginationService } from '@app/services/pagination.service';
import { IDepoList } from '@models/depo';
import { IParameterVersionSummary } from '@models/parameter-trial';
import { ParameterVersionSummaryService } from '@services/parameter-version-summary.service';

import { MatDividerModule } from '@angular/material/divider';
import { FilterComponent } from '@app/components/filter/filter.component';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { FilterService } from '@app/services/filter.service';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import { BreadcrumbsComponent } from '@components/layout/breadcrumbs/breadcrumbs.component';
import ParameterVersionSummaryHeader from '@data/parameter-version-summary-header.json';
import { DepoService } from '@services/depo.service';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { ViewComponent } from '../view/view.component';

@Component({
    selector: 'app-parameter-version-summary-search',
    templateUrl: './parameter-version-summary-search.component.html',
    styleUrls: ['./parameter-version-summary-search.component.scss'],
    imports: [
        BreadcrumbsComponent,
        MatSortModule,
        MatCardModule,
        MatDividerModule,
        MatTabsModule,
        MatTableModule,
        MatCheckboxModule,
        MatIconModule,
        MatButtonModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DatePipe,
        RouterModule,
        FilterComponent,
        PaginationComponent,
        SelectedFilterComponent,
    ]
})
export class ParameterVersionSummarySearchComponent
  implements OnInit, OnDestroy
{
  private destroy$ = new Subject<void>();
  headerData = ParameterVersionSummaryHeader;
  chkAll = false;
  tab1Columns: string[] = ParameterVersionSummaryHeader.map((x: IHeader) => {
    return x.field;
  });
  tab2Columns = [...this.tab1Columns];
  options: DropdownList[] = [];

  dataSource: IParameterVersionSummary[] = [];
  selection: IParameterVersionSummary[] = [];
  rowCount: number = 0;
  currentPage: number = 1;

  params: IParams = {
    page_size: 5,
    page_index: 0,
    sort_order: [],
    search_text: '',
    search_select_filter: {
      day_type: '',
      bus_num: '',
      svc_prov_id: '',
      depot_id: '',
    },
  };

  tabKeys = {
    live_parameters: 'live_parameters',
    trial_parameters: 'trial_parameters',
  };
  tabList = [
    {
      label: 'Live Parameters',
      key: this.tabKeys.live_parameters,
    },
    {
      label: 'Trial Parameters',
      key: this.tabKeys.trial_parameters,
    },
  ];

  tabIdx = 0;
  depots: IDepoList[] = [];
  operators: DropdownList[] = [
    { id: '1', value: 'SBSTransit' },
    { id: '2', value: 'Go Ahead Singapore' },
  ];
  statuses: DropdownList[] = [
    { id: 'approved', value: 'Approved' },
    { id: 'rejected', value: 'Rejected' },
  ];

  pageSize: number;
  chkGroup: { [key: string]: boolean } = {};
  searchForm: FormGroup;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  filterConfigs: IFilterConfig[] = [];

  constructor(
    private parameterVersionSummaryService: ParameterVersionSummaryService,
    private depoService: DepoService,
    private filterService: FilterService,
    public dialog: MatDialog,
    private paginationService: PaginationService
  ) {}

  ngOnInit() {
    this.subscribeToDepoChanges();
    this.loadFilterValues();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTabChange(): void {
    this.filterService.clearSelectedFilters();
  }

  subscribeToDepoChanges(): void {
    // const depotList$ = this.depoService.depoList$;
    // const searchValue$ = this.filterService.searchValue$;
    // combineLatest([depotList$, searchValue$])
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(([depotList, searchValue]) => {
    //     // this.params.search_text = searchValue;
    //     this.depots = depotList;
    //     this.reloadHandler();
    //   });

    const depotList$ = this.depoService.depoList$;
    const searchValue$ = this.filterService.searchValue$;
    const filterValues$ = this.filterService.filterValues$;

    combineLatest([depotList$, searchValue$, filterValues$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([depotList, searchValue, filterValue]) => {
        this.params.search_text = searchValue;
        this.depots = depotList;
        const { depots = [] } = filterValue || {};

        // TODO: Move this in service, all data manipulation should be done in service
        this.params.search_select_filter = {
          ...this.params.search_select_filter,
          depot_id_list: depots,
        };
        this.reloadHandler();

        if (
          this.depots.length > 0 &&
          this.depots?.length !== this.filterConfigs[0]?.options?.length
        )
          this.loadFilterValues();
      });
  }

  loadFilterValues(): void {
    this.filterConfigs = [
      {
        controlName: 'depots',
        value: [],
        type: 'array',
        options: this.depots,
      },
      {
        controlName: 'effectiveDate',
        type: 'date-range',
        children: [
          { controlName: 'startDate', value: '' },
          { controlName: 'endDate', value: '' },
        ],
      },
      {
        controlName: 'status',
        value: [],
        type: 'radio',
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ],
      },
    ];
  }

  reloadHandler(): void {
    this.parameterVersionSummaryService
      .search(this.params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: PayloadResponse) => {
        if (value.status == 200) {
          this.updateDataSource(value.payload);
        }
      });
  }

  updateDataSource(payload: any): void {
    // this.rowCount = payload['records_count'];
    this.dataSource = payload['parameter_version_summary_list'].map(
      this.mapDataList.bind(this)
    );
    this.selection = [];
    this.chkAll = false;
  }

  mapDataList(item: IParameterVersionSummary): IParameterVersionSummary {
    const depot = this.depots.find(_d => _d.depot_id === item.depot_id);
    return {
      ...item,
      depot,
      chk: false,
    };
  }

  sortHandler(element: Sort) {
    this.params.sort_order = [
      { name: element.active, desc: element.direction == 'asc' ? false : true },
    ];
    this.reloadHandler();
  }

  headerHandler(event: MatCheckboxChange, element: IHeader) {
    this.headerData.filter(x => x.field == element.field)[0].chk =
      event.checked;
  }

  hiddenHandler(element: string) {
    return this.headerData.filter(x => x.field == element)[0].chk;
  }

  updateView(action: string) {
    const dialogRef = this.dialog.open(ViewComponent, {
      width: '95%',
      height: '70%',
      disableClose: true,
      data: {
        title: `${action === 'live' ? 'Live' : action === 'trial' ? 'Trial' : ''} Selected`,
        selection: this.selection,
        action,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (['trial', 'trial'].includes(action) && result !== 'cancel') {
        this.tabIdx = 1;
        this.reloadHandler();
      }
    });
  }

  onPageChange(event: IPaginationEvent): void {
    this.paginationService.handlePageEvent(
      this.params,
      event,
      this.reloadHandler.bind(this)
    );
  }
}
