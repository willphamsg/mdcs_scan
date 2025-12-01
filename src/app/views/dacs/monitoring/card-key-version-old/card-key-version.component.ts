import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { TableColumn } from '@app/components/wrapper-table/wrapper-table.component';
import { IBusTransferList } from '@app/models/bus-transfer';
import { PaginationService } from '@app/services/pagination.service';
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
import { MasterService } from '@services/master.service';
import { combineLatest, Observable, of, Subject, takeUntil } from 'rxjs';

interface DeviceData {
  deviceId: string;
  timeOfReporting: string;
  devices: {
    id: string;
    version: string;
  }[];
}

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
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
        CommonModule,
        ReactiveFormsModule,
        MatTableModule,
        MatIcon,
        MatFormFieldModule,
        MatInputModule,
        PaginationComponent,
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
  rowCount: number = 0;
  searchForm: FormGroup;
  depots: IDepoList[] = [];
  depotSelected: string = '';

  dataSource: ICardKeyVersion[] = [];
  params: IParams = {
    page_size: 10,
    page_index: 0,
    sort_order: [],
    search_text: '',
    search_select_filter: {
      status: [],
      current_depot: [],
      current_operator: [],
      future_operator: [],
    },
  };
  chkInconsistent: boolean = false;
  pageSize: number;
  chkGroup: { [key: string]: boolean } = {};

  filterConfigs: any = {};

  exampleData = [
    {
      device_id: { value: 'SG0069', status: 'inconsistent' },
      time: { value: '22/08/2024 15:26:14' },
      device_1: { id: '0', ver: '-', status: 'failed' },
      device_2: { id: '0', ver: '-', status: 'inconsistent' },
      device_3: { id: '0', ver: '-' },
      device_4: { id: '123456', ver: '10,11', status: 'active' },
      device_5: { id: '234567', ver: '-', status: 'failed' },
      device_6: { id: '345678', ver: '20,21', status: 'inconsistent' },
    },
    {
      device_id: { value: 'SBS9559' },
      time: { value: '22/08/2024 14:44:55' },
      device_1: { id: '760093123', ver: '55,56' },
      device_2: { id: '591184123', ver: '55,56', status: 'inconsistent' },
      device_3: { id: '591184123', ver: '55,56' },
      device_4: { id: '456789', ver: '30,31', status: 'active' },
      device_5: { id: '567890', ver: '-', status: 'failed' },
      device_6: { id: '678901', ver: '40,41', status: 'active' },
    },
    {
      device_id: { value: 'QTA2118', status: 'failed' },
      time: { value: '22/08/2024 11:22:39' },
      device_1: { id: '2380118', ver: '56,57' },
      device_2: { id: '0', ver: '-', status: 'failed' },
      device_3: { id: '0', ver: '-', status: 'failed' },
      device_4: { id: '789012', ver: '-', status: 'failed' },
      device_5: { id: '890123', ver: '-', status: 'failed' },
      device_6: { id: '901234', ver: '50,51', status: 'inconsistent' },
    },
    {
      device_id: { value: 'GHA5087', status: 'inconsistent' },
      time: { value: '22/08/2024 10:15:24' },
      device_1: { id: '5087345', ver: '60,61', status: 'inconsistent' },
      device_2: { id: '0', ver: '-', status: 'failed' },
      device_3: { id: '0', ver: '-', status: 'inconsistent' },
      device_4: { id: '012345', ver: '70,71', status: 'active' },
      device_5: { id: '123456', ver: '-', status: 'failed' },
      device_6: { id: '234567', ver: '80,81', status: 'inconsistent' },
    },
    {
      device_id: { value: 'MNP3000', status: 'active' },
      time: { value: '22/08/2024 09:43:50' },
      device_1: { id: '3000123', ver: '62,63', status: 'active' },
      device_2: { id: '3000124', ver: '62,63', status: 'active' },
      device_3: { id: '3000125', ver: '62,63', status: 'active' },
      device_4: { id: '345678', ver: '90,91', status: 'active' },
      device_5: { id: '456789', ver: '100,101', status: 'active' },
      device_6: { id: '567890', ver: '110,111', status: 'active' },
    },
    {
      device_id: { value: 'LTA9090', status: 'inconsistent' },
      time: { value: '22/08/2024 08:30:12' },
      device_1: { id: '9090123', ver: '64,65', status: 'inconsistent' },
      device_2: { id: '9090124', ver: '64,65', status: 'failed' },
      device_3: { id: '0', ver: '-', status: 'failed' },
      device_4: { id: '678901', ver: '-', status: 'failed' },
      device_5: { id: '789012', ver: '120,121', status: 'inconsistent' },
      device_6: { id: '890123', ver: '130,131', status: 'active' },
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

  constructor(
    private masterService: MasterService,
    private depoService: DepoService,
    private paginationService: PaginationService,
    public dialog: MatDialog
  ) {}

  get mainHeaderIds(): string[] {
    return this.headers.map(header => header.id);
  }

  get subHeaderIds(): string[] {
    return this.headers.flatMap(header =>
      header.subHeaders?.length
        ? header.subHeaders.map(subHeader => `${header.id}_${subHeader.id}`)
        : [`${header.id}_placeholder`]
    );
  }

  ngOnInit() {
    this.subscribeToDepoChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  subscribeToDepoChanges(): void {
    const depotList$ = this.depoService.depoList$;

    combineLatest([depotList$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([depotList]) => {
        // this.params.search_text = searchValue;
        this.depots = depotList;

        this.reloadHandler();
      });
  }

  reloadHandler() {
    this.masterService
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
