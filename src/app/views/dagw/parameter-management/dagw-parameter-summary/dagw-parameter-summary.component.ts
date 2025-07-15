import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FilterComponent } from '@app/components/filter/filter.component';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';
import { BreadcrumbsComponent } from '@app/components/layout/breadcrumbs/breadcrumbs.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import {
  DropdownList,
  IHeader,
  IPaginationEvent,
  IParams,
} from '@app/models/common';
import { IDepoList } from '@app/models/depo';
import { IDagwParameterSummary } from '@app/models/parameter-management';
import { DagwParameterSummaryService } from '@app/services/dagw-parameter-summary.service';
import { DepoService } from '@app/services/depo.service';
import { FilterService } from '@app/services/filter.service';
import { PaginationService } from '@app/services/pagination.service';
import { IFilterConfig } from '@app/shared/utils/form-utils';

import DawgParameterSummaryHeader from '@data/dawg-parameter-summary-header.json';
import { combineLatest, Observable, of, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dawg-parameter-summary',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    MatTableModule,
    MatCardModule,
    MatToolbarModule,
    MatTabsModule,
    MatMenuModule,
    MatDividerModule,
    CommonModule,
    PaginationComponent,
    FilterComponent,
    SelectedFilterComponent,
  ],
  providers: [DatePipe, AsyncPipe],
  templateUrl: './dagw-parameter-summary.component.html',
  styleUrl: './dagw-parameter-summary.component.scss',
})
export class DagwParameterSummaryComponent implements OnInit, OnDestroy {
  paginatedData$: Observable<any[]> = of([]);
  depots: IDepoList[] = [];
  chkAll: boolean = false;
  dataSource: IDagwParameterSummary[] = [];

  selection: IDagwParameterSummary[] = [];
  rowCount: number = 0;

  params: IParams = {
    page_size: 10,
    page_index: 0,
    sort_order: [],
    search_text: '',
    search_select_filter: {
      depot_id_list: [],
      consistency_list: [],
      active_list: '',
    },
  };

  dataSource$: Observable<IDagwParameterSummary[]> = of([]);

  headerData = DawgParameterSummaryHeader;
  tab1Columns: string[] = this.headerData.map((x: IHeader) => x.field);

  consistencyOptions: DropdownList[] = [
    { id: '0', value: 'Yes' },
    { id: '1', value: 'No' },
  ];
  activeParameterOptions: DropdownList[] = [
    { id: '0', value: 'Yes' },
    { id: '1', value: 'No' },
  ];

  filterConfigs: IFilterConfig[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private dagwParameterSummaryService: DagwParameterSummaryService,
    private depoService: DepoService,
    private paginationService: PaginationService,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    // this.paginatedData$ = this.paginationService.paginatedData$;
    // this.dataSource$ = this.dagwParameterSummaryService.getDagwDataList('');
    // this.selectedFilter = this.filterService.getSelectedFilters();
    // this.loadFilterValues();
    this.subscribeToDepoChanges();
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
          consistency = [],
          active = [],
        } = filterValue || {};

        this.params.search_select_filter = {
          ...this.params.search_select_filter,
          depot_id_list: depots,
          consistency_list: consistency,
          active_list: active,
        };
        this.reloadHandler();
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
        controlName: 'consistency',
        value: [],
        type: 'array',
        options: this.consistencyOptions,
      },
      {
        controlName: 'active',
        value: [],
        type: 'array',
        options: this.activeParameterOptions,
      },
    ];
    // this.dagwParameterSummaryService
    //   .getDepotService('')
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((depots: IDepoList[]) => {
    //     this.depotList = depots;

    //     this.filterConfigs = [
    //       {
    //         controlName: 'depots',
    //         value: [],
    //         type: 'array',
    //         options: this.depotList,
    //       },
    //       {
    //         controlName: 'effectiveDate',
    //         type: 'date-range',
    //         children: [
    //           { controlName: 'startDate', value: '' },
    //           { controlName: 'endDate', value: '' },
    //         ],
    //       },
    //       {
    //         controlName: 'consistency',
    //         value: [],
    //         type: 'array',
    //         options: this.consistencyOptions,
    //       },
    //       {
    //         controlName: 'active',
    //         value: [],
    //         type: 'array',
    //         options: this.activeParameterOptions,
    //       },
    //     ];
    //   });
  }

  reloadHandler() {
    this.dagwParameterSummaryService.search(this.params).subscribe({
      next: value => {
        if (value.status === 200) {
          this.updateDataSource(value.payload);
        }
      },
    });
  }

  updateDataSource(payload: any): void {
    this.rowCount = payload['records_count'];
    this.dataSource = payload['dagw_parameter_summary'].map(
      this.mapList.bind(this)
    );
    this.selection = [];
    this.chkAll = false;
  }

  mapList(item: IDagwParameterSummary): IDagwParameterSummary {
    return <IDagwParameterSummary>{
      ...item,
    };
  }

  onPageChange(event: IPaginationEvent): void {
    this.paginationService.handlePageEvent(
      this.params,
      event,
      this.reloadHandler.bind(this)
    );
  }

  sortHandler(element: Sort) {
    this.params.sort_order = [
      { name: element.active, desc: element.direction == 'asc' ? false : true },
    ];
    this.reloadHandler();
  }
}
