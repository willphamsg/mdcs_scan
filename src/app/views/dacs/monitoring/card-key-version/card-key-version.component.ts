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
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { FilterComponent } from '@app/components/filter/filter.component';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { IBusTransferList } from '@app/models/bus-transfer';
import { ManageCardKeyVersionService } from '@app/services/card-key-version.service';
import { FilterService } from '@app/services/filter.service';
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

@Component({
  selector: 'app-mdcs-card-key-version',
  standalone: true,
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
    FilterComponent,
    PaginationComponent,
    SelectedFilterComponent,
  ],
  providers: [MatDatepickerModule],
  templateUrl: './card-key-version.component.html',
  styleUrls: ['./card-key-version.component.scss'],
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

  dagwSource: [];
  dataSource: ICardKeyVersion[] = [];
  params: IParams = {
    page_size: 10,
    page_index: 0,
    sort_order: [],
    search_text: '',
    search_select_filter: {
      depot_id_list: [],
      status_list: [],
    },
  };
  chkInconsistent: boolean = false;
  pageSize: number;
  chkGroup: { [key: string]: boolean } = {};

  filterConfigs: any = {};

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  constructor(
    private manageCardKeyVersionService: ManageCardKeyVersionService,
    private depoService: DepoService,
    private filterService: FilterService,
    private paginationService: PaginationService,
    public dialog: MatDialog
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
    combineLatest([depotList$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([depotList]) => {
        this.depots = depotList;
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
    ];
  }

  searchText(e: any) {
    this.params.search_text = e.target.value;
    this.reloadHandler();
  }

  searchDepot() {
    console.log(this.depotSelected);
    this.params.search_select_filter['depot_id_list'] = [this.depotSelected];
    this.reloadHandler();
  }

  searchStatus() {
    console.log(this.chkInconsistent);
    this.params.search_select_filter['status_list'] = this.chkInconsistent
      ? [1]
      : [];
    this.reloadHandler();
  }

  reloadHandler() {
    this.manageCardKeyVersionService
      .search(this.params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value: PayloadResponse) => {
          if (value.status == 200) {
            console.log(value);
            this.updateDataSource(value.payload);
          }
        },
      });
  }

  updateDataSource(payload: any): void {
    this.rowCount = payload['records_count'];
    this.dataSource = payload['card_key_version_list'];
    this.dagwSource = payload['dagw_card_key_version'].ver.split(',');
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
