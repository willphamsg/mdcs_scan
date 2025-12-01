import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
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
  IPaginationEvent,
  PayloadResponse,
  IParams,
} from '@models/common';
import { PaginationService } from '@app/services/pagination.service';
import { IDepoList } from '@models/depo';
import { IParameterMode } from '@models/parameter-trial';

import { MatDividerModule } from '@angular/material/divider';
import { FilterComponent } from '@app/components/filter/filter.component';
import { MonthFilterComponent } from '@app/components/filter/month-filter/month-filter.component';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { FilterService } from '@app/services/filter.service';
import { ParameterModeService } from '@app/services/parameter-mode.service';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import { BreadcrumbsComponent } from '@components/layout/breadcrumbs/breadcrumbs.component';
import ParameterModeHeader from '@data/parameter-mode-header.json';
import { DepoService } from '@services/depo.service';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { ViewComponent } from '../view/view.component';

@Component({
    selector: 'app-parameter-mode-search',
    templateUrl: './parameter-mode-search.component.html',
    styleUrls: ['./parameter-mode-search.component.scss'],
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
        CommonModule,
        MatDividerModule,
        FormsModule,
        FilterComponent,
        PaginationComponent,
        SelectedFilterComponent,
        MonthFilterComponent,
    ]
})
export class ParameterModeSearchComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  headerData = ParameterModeHeader;
  chkAll: boolean = false;
  displayedColumns: string[] = ParameterModeHeader.map((x: IHeader) => {
    return x.field;
  });
  options: DropdownList[] = [];
  dataSource: IParameterMode[] = [];
  selection: IParameterMode[] = [];
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
    private parameterModeService: ParameterModeService,
    private depoService: DepoService,
    public dialog: MatDialog,
    private filterService: FilterService,
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

  subscribeToDepoChanges(): void {
    // this.depoService.depo$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((value: string) => {
    //     this.params.depot_id = value;
    //     this.reloadHandler();
    //   });
    // this.depoService?.depoList$?.pipe(takeUntil(this.destroy$)).subscribe({
    //   next: (val: IDepoList[]) => (this.depots = val),
    // });

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
    ];
  }

  onTabChange(): void {
    this.filterService.clearSelectedFilters();
  }

  reloadHandler() {
    // if (this.params.depot_id) {
    this.fetchParameterModeList();
    // }
  }

  fetchParameterModeList(): void {
    this.parameterModeService
      .search(this.params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value: PayloadResponse) => {
          if (value.status == 200) {
            this.rowCount = value.payload['records_count'];
            const source = value.payload['parameter_mode_list'];
            this.dataSource = source.map((item: IParameterMode) => {
              return <IParameterMode>{ ...item, chk: false };
            });
            this.selection = [];
            this.chkAll = false;
          }
        },
      });
  }

  checkboxToggle(element: any): void {
    element.chk = !element.chk;
    const matCheckboxChange: MatCheckboxChange = {
      source: {
        checked: element.chk,
      } as any,
      checked: element.chk,
    };

    this.checkHandler(matCheckboxChange, element);
  }

  onCheckAllToggle(): void {
    this.chkAll = !this.chkAll;

    this.checkAllHandler({
      source: {
        checked: this.chkAll,
      } as any,
      checked: this.chkAll,
    });
  }

  checkHandler(event: MatCheckboxChange, element: IParameterMode) {
    this.selection = event.checked
      ? [...this.selection, element]
      : this.selection.filter(x => x.id !== element.id);
  }

  checkAllHandler(event: MatCheckboxChange) {
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

    this.parameterModeService
      .search(this.params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value: PayloadResponse) => {
          if (value.status == 200) {
            const source = value.payload['parameter_mode_list'];
            this.params.page_size = originalPageSize;
            this.selection = source.map((item: IParameterMode) => {
              return <IParameterMode>{
                ...item,
              };
            });
          }
        },
      });
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
      if (['live', 'trial'].includes(action) && result !== 'cancel') {
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
