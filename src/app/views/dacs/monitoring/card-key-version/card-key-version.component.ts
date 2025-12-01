import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { TableColumn } from '@app/components/wrapper-table/wrapper-table.component';
import { IBusTransferList } from '@app/models/bus-transfer';
import { PaginationService } from '@app/services/pagination.service';
import { FilterService } from '@app/services/filter.service';
import { BreadcrumbsComponent } from '@components/layout/breadcrumbs/breadcrumbs.component';
import CardKeyVersionHeader from '@data/card-key-version-header.json';
import { ICardKeyVersion } from '@models/card-key-version';

import {
  IHeader,
  IPaginationEvent,
  IParams,
  PayloadResponse,
} from '@models/common';
import { IDepoList } from '@models/depo';
import { DepoService } from '@services/depo.service';
import { ManageCardKeyVersionService } from '@services/card-key-version.service';
import {
  combineLatest,
  Observable,
  of,
  Subject,
  takeUntil,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs';
import { AgGridAngular } from 'ag-grid-angular';
import type {
  ColDef,
  ColGroupDef,
  GetDetailRowDataParams,
  GridApi,
  GridOptions,
  GridReadyEvent,
  SizeColumnsToFitGridStrategy,
  ValueFormatterFunc,
  ValueFormatterParams,
  ValueGetterParams,
  RowHeightParams,
  IsFullWidthRowParams,
} from 'ag-grid-community';
import {
  AllCommunityModule,
  ClientSideRowModelModule,
  ModuleRegistry,
} from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule, ClientSideRowModelModule]);

@Component({
    selector: 'app-mdcs-card-key-version',
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
        MatDividerModule,
        MatSelectModule,
        MatOptionModule,
        MatInputModule,
        CommonModule,
        FormsModule,
        CommonModule,
        ReactiveFormsModule,
        MatTableModule,
        MatIcon,
        MatFormFieldModule,
        MatInputModule,
        PaginationComponent,
        AgGridAngular,
    ],
    providers: [MatDatepickerModule],
    templateUrl: './card-key-version.component.html',
    styleUrls: ['./card-key-version.component.scss']
})
export class ViewCardKeyVersionComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  paginatedData$: Observable<IBusTransferList[]> = of([]);

  headerData = CardKeyVersionHeader;
  displayedColumns: string[] = CardKeyVersionHeader.map((x: IHeader) => {
    return x.field;
  });
  searchForm: FormGroup;
  depots: IDepoList[] = [];
  depotSelected: string = '';

  dataSource: ICardKeyVersion[] = [];
  rowCount: number = 0;
  currentPage: number = 1;

  params: IParams = {
    page_size: 10,
    page_index: 0,
    sort_order: [],
    search_text: '',
    search_select_filter: { depot: '' },
  };
  chkInconsistent: boolean = false;
  pageSize: number;
  chkGroup: { [key: string]: boolean } = {};

  filterConfigs: any = {};

  exampleData = [
    {
      device_id: { value: 'SG0069', status: 'inconsistent' },
      time: { value: '2024-12-25T23:15:30' },
      device_1: { id: { value: '0' }, ver: { value: '-' } },
      device_2: { id: { value: '0' }, ver: { value: '-' } },
      device_3: { id: { value: '0' }, ver: { value: '-' } },
      device_4: { id: { value: '0' }, ver: { value: '-' } },
      device_5: { id: { value: '0' }, ver: { value: '-' } },
      device_6: { id: { value: '0' }, ver: { value: '-' } },
    },
    {
      device_id: { value: 'SBS9559' },
      time: { value: '2024-09-25T23:15:30' },
      device_1: { id: { value: '760093123' }, ver: { value: '55,56' } },
      device_2: { id: { value: '591184123' }, ver: { value: '55,56' } },
      device_3: { id: { value: '591184123' }, ver: { value: '55,56' } },
      device_4: { id: { value: '591184123' }, ver: { value: '30,31' } },
      device_5: { id: { value: '0' }, ver: { value: '-' } },
      device_6: { id: { value: '0' }, ver: { value: '-' } },
    },
    {
      device_id: { value: 'SBS0009' },
      time: { value: '2024-11-10T23:15:30' },
      device_1: { id: { value: '591184123' }, ver: { value: '56,57' } },
      device_2: { id: { value: '0' }, ver: { value: '-' } },
      device_3: { id: { value: '0' }, ver: { value: '-' } },
      device_4: { id: { value: '0' }, ver: { value: '-' } },
      device_5: { id: { value: '0' }, ver: { value: '-' } },
      device_6: { id: { value: '0' }, ver: { value: '-' } },
    },
    {
      device_id: { value: 'SBS0022' },
      time: { value: '2024-12-12T23:15:30' },
      device_1: { id: { value: '0' }, ver: { value: '56,57' } },
      device_2: { id: { value: '4' }, ver: { value: '56,57' } },
      device_3: { id: { value: '1' }, ver: { value: '54,55,56,57' } },
      device_4: { id: { value: '76009379' }, ver: { value: '57' } },
      device_5: { id: { value: '0' }, ver: { value: '56,57' } },
      device_6: { id: { value: '76009379' }, ver: { value: '55,56,57' } },
    },
    {
      device_id: { value: 'SBS0023', status: 'inconsistent' },
      time: { value: '2024-12-25T23:15:30' },
      device_1: {
        id: { value: '591184123' },
        ver: { value: '55,56,57', status: 'inconsistent' },
      },
      device_2: { id: { value: '0' }, ver: { value: '-' } },
      device_3: {
        id: { value: '591184123' },
        ver: { value: '55,56,57', status: 'inconsistent' },
      },
      device_4: {
        id: { value: '591184123' },
        ver: { value: '55,56,57', status: 'inconsistent' },
      },
      device_5: { id: { value: '0' }, ver: { value: '-' } },
      device_6: { id: { value: '0' }, ver: { value: '-' } },
    },
    {
      device_id: { value: 'QTA2118', status: 'failed' },
      time: { value: '2024-12-25T23:15:30' },
      device_1: { id: '2380118', ver: { value: '56,57', status: 'failed' } },
      device_2: { id: { value: '0' }, ver: { value: '-', status: 'failed' } },
      device_3: { id: { value: '0' }, ver: { value: '-', status: 'failed' } },
      device_4: { id: { value: '0' }, ver: { value: '-', status: 'failed' } },
      device_5: { id: { value: '0' }, ver: { value: '-', status: 'failed' } },
      device_6: { id: { value: '0' }, ver: { value: '-', status: 'failed' } },
    },
    {
      device_id: { value: 'PA1597' },
      time: { value: '2024-12-25T23:15:30' },
      device_1: { id: { value: '0' }, ver: { value: '-' } },
      device_2: { id: { value: '0' }, ver: { value: '-' } },
      device_3: { id: { value: '0' }, ver: { value: '-' } },
      device_4: { id: { value: '0' }, ver: { value: '-' } },
      device_5: { id: { value: '0' }, ver: { value: '-' } },
      device_6: { id: { value: '0' }, ver: { value: '-' } },
    },
  ];

  headers = [
    { id: 'no', name: 'No.', subHeaders: [] },
    { id: 'device_id', name: 'Device ID', subHeaders: [] },
    { id: 'time', name: 'Time Of Reporting', subHeaders: [] },
    {
      id: 'device_1',
      name: 'Device 1',
      subHeaders: [
        { id: 'id', name: 'ID' },
        { id: 'ver', name: 'Ver' },
      ],
    },
    {
      id: 'device_2',
      name: 'Device 2',
      subHeaders: [
        { id: 'id', name: 'ID' },
        { id: 'ver', name: 'Ver' },
      ],
    },
    {
      id: 'device_3',
      name: 'Device 3',
      subHeaders: [
        { id: 'id', name: 'ID' },
        { id: 'ver', name: 'Ver' },
      ],
    },
    {
      id: 'device_4',
      name: 'Device 4',
      subHeaders: [
        { id: 'id', name: 'ID' },
        { id: 'ver', name: 'Ver' },
      ],
    },
    {
      id: 'device_5',
      name: 'Device 5',
      subHeaders: [
        { id: 'id', name: 'ID' },
        { id: 'ver', name: 'Ver' },
      ],
    },
    {
      id: 'device_6',
      name: 'Device 6',
      subHeaders: [
        { id: 'id', name: 'ID' },
        { id: 'ver', name: 'Ver' },
      ],
    },
  ];

  columnDefs: string[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  rowData = [
    {
      device_id: { value: 'SG0069', status: 'inconsistent' },
      time: { value: '2024-12-25T23:15:30' },
      device_1: { id: { value: '0' }, ver: { value: '-' }, status: 'failed' },
      device_2: {
        id: { value: '0' },
        ver: { value: '-' },
        status: 'inconsistent',
      },
      device_3: { id: { value: '0' }, ver: { value: '-' } },
      device_4: { id: '123456', ver: '10,11', status: 'active' },
      device_5: { id: '234567', ver: '-', status: 'failed' },
      device_6: { id: '345678', ver: '20,21', status: 'inconsistent' },
    },
    {
      device_id: { value: 'SBS9559' },
      time: { value: '2024-09-25T23:15:30' },
      device_1: { id: { value: '760093123' }, ver: { value: '55,56' } },
      device_2: {
        id: { value: '591184123' },
        ver: { value: '55,56' },
        status: 'inconsistent',
      },
      device_3: { id: { value: '591184123' }, ver: { value: '55,56' } },
      device_4: { id: '456789', ver: { value: '30,31' }, status: 'active' },
      device_5: { id: '567890', ver: '-', status: 'failed' },
      device_6: { id: '678901', ver: '40,41', status: 'active' },
    },
    {
      device_id: { value: 'QTA2118', status: 'failed' },
      time: { value: '2024-11-10T23:15:30' },
      device_1: { id: '2380118', ver: { value: '56,57' } },
      device_2: { id: { value: '0' }, ver: { value: '-' }, status: 'failed' },
      device_3: { id: { value: '0' }, ver: { value: '-' }, status: 'failed' },
      device_4: { id: '789012', ver: '-', status: 'failed' },
      device_5: { id: '890123', ver: '-', status: 'failed' },
      device_6: { id: '901234', ver: '50,51', status: 'inconsistent' },
    },
    {
      device_id: { value: 'GHA5087', status: 'inconsistent' },
      time: { value: '2024-12-12T23:15:30' },
      device_1: { id: '5087345', ver: '60,61', status: 'inconsistent' },
      device_2: { id: { value: '0' }, ver: { value: '-' }, status: 'failed' },
      device_3: {
        id: { value: '0' },
        ver: { value: '-' },
        status: 'inconsistent',
      },
      device_4: { id: '012345', ver: '70,71', status: 'active' },
      device_5: { id: '123456', ver: '-', status: 'failed' },
      device_6: { id: '234567', ver: '80,81', status: 'inconsistent' },
    },
    {
      device_id: { value: 'MNP3000', status: 'active' },
      time: { value: '2024-12-25T23:15:30' },
      device_1: { id: '3000123', ver: '62,63', status: 'active' },
      device_2: { id: '3000124', ver: '62,63', status: 'active' },
      device_3: { id: '3000125', ver: '62,63', status: 'active' },
      device_4: { id: '345678', ver: '90,91', status: 'active' },
      device_5: { id: '456789', ver: '100,101', status: 'active' },
      device_6: { id: '567890', ver: '110,111', status: 'active' },
    },
    {
      device_id: { value: 'LTA9090', status: 'inconsistent' },
      time: { value: '2024-12-25T23:15:30' },
      device_1: { id: '9090123', ver: '64,65', status: 'inconsistent' },
      device_2: { id: '9090124', ver: '64,65', status: 'failed' },
      device_3: { id: { value: '0' }, ver: { value: '-' }, status: 'failed' },
      device_4: { id: '678901', ver: '-', status: 'failed' },
      device_5: { id: '789012', ver: '120,121', status: 'inconsistent' },
      device_6: { id: '890123', ver: '130,131', status: 'active' },
    },
  ];

  // Column Definitions: Defines the columns to be displayed.
  colDefs: (ColDef | ColGroupDef)[] = [
    {
      field: 'no',
      headerName: 'No.',
      headerClass: 'ag-center-header',
      valueGetter: params => (params.node?.rowIndex ?? 0) + 1,
      width: 70,
      cellStyle: { 'text-align': 'center' },
      suppressMovable: true,
      children: [
        {
          field: 'id',
          headerName: '',
          valueGetter: params => (params.node?.rowIndex ?? 0) + 1,
        },
      ],
    },
    {
      field: 'device_id',
      headerName: 'Device ID',
      headerClass: 'ag-center-header',
      width: 120,
      sortable: true,
      valueGetter: (params: ValueGetterParams) => params.data.device_id.value,
      cellClass: params => params.data.device_id.status || '',
      children: [
        {
          field: 'id',
          headerName: '',
          valueGetter: (params: ValueGetterParams) =>
            params.data.device_id.value,
          cellClass: params => params.data.device_id.status || '',
        },
      ],
    },
    {
      field: 'time',
      headerName: 'Time Of\nReporting',
      headerClass: 'ag-center-header',
      sortable: true,
      minWidth: 200,
      headerComponentParams: { menuIcon: 'fa-external-link-alt' },
      valueFormatter: (params: ValueFormatterParams) => {
        const date = new Date(params.data.time.value);
        const dateStr = date.toLocaleDateString('en-SG');
        const timeStr = date.toLocaleTimeString('en-SG', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
        return `${dateStr}\n${timeStr}`;
      },
      cellStyle: {
        'white-space': 'wrap',
        'line-height': '1.3',
        padding: '4px',
      },
      children: [
        {
          field: 'id',
          headerName: '',
          valueFormatter: (params: ValueFormatterParams) => {
            const date = new Date(params.data.time.value);
            const dateStr = date.toLocaleDateString('en-SG');
            const timeStr = date.toLocaleTimeString('en-SG', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            });
            return `${dateStr}\n${timeStr}`;
          },
        },
      ],
    },
    {
      field: 'device_1',
      headerName: 'Device 1',
      headerClass: 'ag-center-header',
      children: [
        {
          field: 'id',
          headerName: 'ID',
          valueGetter: (params: ValueGetterParams) =>
            params.data.device_1.id.value,
          cellClass: params => params.data.device_1.id?.status || '',
        },
        {
          field: 'ver',
          headerName: 'Ver',
          valueGetter: (params: ValueGetterParams) =>
            params.data.device_1.ver?.value,
          cellClass: params => params.data.device_1.ver?.status || '',
        },
      ],
    },
    {
      field: 'device_2',
      headerName: 'Device 2',
      headerClass: 'ag-center-header',
      children: [
        {
          field: 'id',
          headerName: 'ID',
          valueGetter: (params: ValueGetterParams) =>
            params.data.device_2.id?.value,
          cellClass: params => params.data.device_2?.id?.status || '',
        },
        {
          field: 'ver',
          headerName: 'Ver',
          valueGetter: (params: ValueGetterParams) =>
            params.data.device_2.ver?.value,
          cellClass: params => params.data.device_2?.ver?.status || '',
        },
      ],
    },
    {
      field: 'device_3',
      headerName: 'Device 3',
      headerClass: 'ag-center-header',
      children: [
        {
          field: 'id',
          headerName: 'ID',
          valueGetter: (params: ValueGetterParams) =>
            params.data.device_3.id?.value,
          cellClass: params => params.data.device_3?.id?.status || '',
        },
        {
          field: 'ver',
          headerName: 'Ver',
          valueGetter: (params: ValueGetterParams) =>
            params.data.device_3.ver?.value,
          cellClass: params => params.data.device_3.ver?.status || '',
        },
      ],
    },
    {
      field: 'device_4',
      headerName: 'Device 4',
      headerClass: 'ag-center-header',
      children: [
        {
          field: 'id',
          headerName: 'ID',
          valueGetter: (params: ValueGetterParams) =>
            params.data.device_4.id?.value,
          cellClass: params => params.data.device_4?.id?.status || '',
        },
        {
          field: 'ver',
          headerName: 'Ver',
          valueGetter: (params: ValueGetterParams) =>
            params.data.device_4.ver?.value,
          cellClass: params => params.data.device_4?.ver?.status || '',
        },
      ],
    },
    {
      field: 'device_5',
      headerName: 'Device 5',
      headerClass: 'ag-center-header',
      children: [
        {
          field: 'id',
          headerName: 'ID',
          valueGetter: (params: ValueGetterParams) =>
            params.data.device_5.id?.value,
          cellClass: params => params.data.device_5?.id?.status || '',
        },
        {
          field: 'ver',
          headerName: 'Ver',
          valueGetter: (params: ValueGetterParams) =>
            params.data.device_5.ver?.value,
          cellClass: params => params.data.device_5?.ver?.status || '',
        },
      ],
    },
    {
      field: 'device_6',
      headerName: 'Device 6',
      headerClass: 'ag-center-header',
      children: [
        {
          field: 'id',
          headerName: 'ID',
          valueGetter: (params: ValueGetterParams) =>
            params.data.device_6.id?.value,
          cellClass: params => params.data.device_6?.id?.status || '',
        },
        {
          field: 'ver',
          headerName: 'Ver',
          valueGetter: (params: ValueGetterParams) =>
            params.data.device_6.ver?.value,
          cellClass: params => params.data.device_6?.ver?.status || '',
        },
      ],
    },
  ];

  gridOptions: GridOptions = {
    columnDefs: this.colDefs,
    defaultColDef: {
      flex: 1,
      filter: false,
      sortable: false,
      resizable: true,
    },
    rowData: this.exampleData,
  };

  searchControl = new FormControl('');

  constructor(
    private carKeyVersionService: ManageCardKeyVersionService,
    private depoService: DepoService,
    public dialog: MatDialog,
    private filterService: FilterService,
    private paginationService: PaginationService
  ) {}

  ngOnInit() {
    this.subscribeToDepoChanges();

    this.searchControl.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(value => {
        // if (value)
        this.filterService.updateSearchValue(value);
      });
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

        // Reset page when new filter/search happens
        this.paginationService.currentPage = 1;
        this.params.page_index = 0;
        this.currentPage = 1;

        this.reloadHandler();
      });

    // combineLatest([depotList$])
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(([depotList]) => {
    //     // this.params.search_text = searchValue;
    //     this.depots = depotList;
    //     this.reloadHandler();
    //   });
  }

  reloadHandler() {
    this.carKeyVersionService
      .search(this.params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value: PayloadResponse) => {
          if (value.status == 200) {
            this.updateDataSource(value.payload);
          }
        },
      });
  }

  handleSelectDepot(event: any) {
    this.depotSelected = event.value;
    this.params.search_select_filter['depot'] = event.value;
    this.reloadHandler();
  }

  updateDataSource(payload: any): void {
    this.rowCount = payload['records_count'];
    this.dataSource = payload['card_key_version_list'];
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
