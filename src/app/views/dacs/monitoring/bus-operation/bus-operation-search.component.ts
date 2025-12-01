import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

import { BreadcrumbsComponent } from '@components/layout/breadcrumbs/breadcrumbs.component';
import BusOperationHeader from '@data/bus-operation-header.json';
import {
  DropdownList,
  IHeader,
  IPaginationEvent,
  IParams,
  PayloadResponse,
} from '@models/common';

import { IBusOperationList } from '@models/bus-operation';
import { IDepoList } from '@models/depo';
import { DepoService } from '@services/depo.service';
import { MasterService } from '@services/master.service';
// import { ViewComponent } from '../view/view.component';
import { RouterModule } from '@angular/router';
import { FilterComponent } from '@app/components/filter/filter.component';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { FilterService } from '@app/services/filter.service';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { PaginationService } from '@app/services/pagination.service';

@Component({
    selector: 'app-mdcs-bus-operation-search',
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
    templateUrl: './bus-operation-search.component.html',
    styleUrls: ['./bus-operation-search.component.scss']
})
export class BusOperationSearchComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();

  headerData = BusOperationHeader;
  displayedColumns: string[] = BusOperationHeader.map((x: IHeader) => {
    return x.field;
  });
  searchForm: FormGroup;

  options: DropdownList[] = [];

  statusOptions: DropdownList[] = [
    { id: 'success', value: 'Success' },
    { id: 'failed', value: 'Failed' },
  ];
  connectStatusOptions: DropdownList[] = [
    { id: 'connect', value: 'Connect' },
    { id: 'disconnect', value: 'Disconnect' },
  ];
  depots: IDepoList[] = [];
  dataSource: IBusOperationList[] = [];
  rowCount: number = 33;
  currentPage: number = 1;

  params: IParams = {
    page_size: 10,
    page_index: 0,
    sort_order: [],
    search_text: '',
    search_select_filter: {
      depots: [],
      connections: [],
      downloadStatus: [],
      uploadStatus: [],
      authStatus: [],
    },
  };

  pageSize: number;
  filterConfigs: any = {};

  constructor(
    private masterService: MasterService,
    private depoService: DepoService,
    public dialog: MatDialog,
    private paginationService: PaginationService,
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
    const depotList$ = this.depoService.depoList$;
    const searchValue$ = this.filterService.searchValue$;
    const filterValues$ = this.filterService.filterValues$;

    combineLatest([depotList$, searchValue$, filterValues$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([depotList, searchValue, filterValue]) => {
        this.params.search_text = searchValue;
        this.depots = depotList;
        const {
          depots = [],
          connection = [],
          download = [],
          upload = [],
          auth = [],
        } = filterValue || {};

        this.params.search_select_filter = {
          ...this.params.search_select_filter,
          depots: depots,
          connections: connection,
          downloadStatus: download,
          uploadStatus: upload,
          authStatus: auth,
        };

        // Reset page when new filter/search happens
        this.paginationService.currentPage = 1;
        this.params.page_index = 0;
        this.currentPage = 1;

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
        controlName: 'connection',
        value: [],
        type: 'array',
        options: this.connectStatusOptions,
      },
      {
        controlName: 'download',
        value: [],
        type: 'array',
        options: this.statusOptions,
      },
      {
        controlName: 'upload',
        value: [],
        type: 'array',
        options: this.statusOptions,
      },
      {
        controlName: 'auth',
        value: [],
        type: 'array',
        options: this.statusOptions,
      },
    ];
  }

  reloadHandler() {
    if (this.depots) {
      this.masterService.search(this.params).subscribe({
        next: (value: PayloadResponse) => {
          if (value.status == 200) {
            this.updateDataSource(value.payload);
          }
        },
      });
    }
  }

  updateDataSource(payload: any): void {
    this.rowCount = payload['records_count'];
    this.dataSource = payload['bus_operation_list'];
  }

  onPageChange(event: IPaginationEvent): void {
    this.paginationService.handlePageEvent(
      this.params,
      event,
      this.reloadHandler.bind(this)
    );
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
