import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FilterComponent } from '@app/components/filter/filter.component';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';
import { BreadcrumbsComponent } from '@app/components/layout/breadcrumbs/breadcrumbs.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import {
  DropdownList,
  IHeader,
  IParams,
  IPaginationEvent,
  TDate,
} from '@app/models/common';
import { PaginationService } from '@app/services/pagination.service';
import { IDepoList } from '@app/models/depo';
import { IDagwParameterSummary } from '@app/models/parameter-management';
import { DagwParameterSummaryService } from '@app/services/dagw-parameter-summary.service';
import { DepoService } from '@app/services/depo.service';
import { FilterService } from '@app/services/filter.service';
import { IFilterConfig } from '@app/shared/utils/form-utils';

import DawgParameterSummaryHeader from '@data/dawg-parameter-summary-header.json';
import { combineLatest, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-dawg-parameter-summary',
    imports: [
        BreadcrumbsComponent,
        MatTableModule,
        MatCardModule,
        MatToolbarModule,
        MatTabsModule,
        MatMenuModule,
        MatDividerModule,
        MatSortModule,
        CommonModule,
        PaginationComponent,
        FilterComponent,
        SelectedFilterComponent,
    ],
    providers: [DatePipe, AsyncPipe],
    templateUrl: './dagw-parameter-summary.component.html',
    styleUrl: './dagw-parameter-summary.component.scss'
})
export class DagwParameterSummaryComponent implements OnInit, OnDestroy {
  headerData = DawgParameterSummaryHeader;
  tab1Columns: string[] = this.headerData.map((x: IHeader) => x.field);

  consistencyOptions: DropdownList[] = [
    { id: '1', value: 'Consistent' },
    { id: '0', value: 'Not Consistent' },
  ];
  activeParameterOptions: DropdownList[] = [
    { id: '0', value: 'Yes' },
    { id: '1', value: 'No' },
  ];

  params: IParams = {
    page_size: 10,
    page_index: 0,
    sort_order: [],
    search_text: '',
    search_select_filter: {
      depot_id_list: [],
      effective_date_dagw_live_from: '',
      effective_date_dagw_live_till: '',
      effective_date_dagw_trial_from: '',
      effective_date_dagw_trial_till: '',
      consistency_list: [],
      // active_list: [],
    },
  };
  depots: IDepoList[] = [];
  dataSource: IDagwParameterSummary[] = [];
  rowCount: number = 0;
  currentPage: number = 1;

  filterConfigs: IFilterConfig[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private dagwParameterSummaryService: DagwParameterSummaryService,
    private filterService: FilterService,
    private depoService: DepoService,
    private paginationService: PaginationService
  ) {}

  ngOnInit(): void {
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
          depotsSec = [],
          effectiveDateDAGWLive = [],
          effectiveDateDAGWTrial = [],
          consistency = [],
        } = filterValue || {};

        // TODO: Move this in service, all data manipulation should be done in service
        this.params.search_select_filter = {
          ...this.params.search_select_filter,
          depot_id_list: depotsSec,
          effective_date_dagw_live_from:
            Array.isArray(effectiveDateDAGWLive) &&
            effectiveDateDAGWLive.length > 0
              ? new DatePipe('en-US').transform(
                  effectiveDateDAGWLive[0],
                  'yyyy-MM-dd HH:mm:ss'
                ) + ''
              : (effectiveDateDAGWLive as TDate).startDate || '',
          effective_date_dagw_live_till:
            Array.isArray(effectiveDateDAGWLive) &&
            effectiveDateDAGWLive.length > 1
              ? new DatePipe('en-US').transform(
                  effectiveDateDAGWLive[1],
                  'yyyy-MM-dd HH:mm:ss'
                ) + ''
              : (effectiveDateDAGWLive as TDate).endDate || '',
          effective_date_dagw_trial_from:
            Array.isArray(effectiveDateDAGWTrial) &&
            effectiveDateDAGWTrial.length > 0
              ? new DatePipe('en-US').transform(
                  effectiveDateDAGWTrial[0],
                  'yyyy-MM-dd HH:mm:ss'
                ) + ''
              : (effectiveDateDAGWTrial as TDate).startDate || '',
          effective_date_dagw_trial_till:
            Array.isArray(effectiveDateDAGWTrial) &&
            effectiveDateDAGWTrial.length > 1
              ? new DatePipe('en-US').transform(
                  effectiveDateDAGWTrial[1],
                  'yyyy-MM-dd HH:mm:ss'
                ) + ''
              : (effectiveDateDAGWTrial as TDate).endDate || '',
          consistency_list: consistency,
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
        controlName: 'depotsSec',
        value: [],
        type: 'array',
        options: this.depots,
      },
      {
        controlName: 'effectiveDateDAGWLive',
        type: 'date-range',
        children: [
          { controlName: 'startDate', value: '' },
          { controlName: 'endDate', value: '' },
        ],
      },
      {
        controlName: 'effectiveDateDAGWTrial',
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
      // {
      //   controlName: 'active',
      //   value: [],
      //   type: 'array',
      //   options: this.activeParameterOptions,
      // },
    ];
  }

  reloadHandler() {
    this.dagwParameterSummaryService
      .search(this.params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: value => {
          if (value.status === 200) {
            this.updateDataSource(value.payload);
          }
        },
      });
  }

  updateDataSource(payload: any): void {
    this.rowCount = payload['records_count'];
    this.dataSource = payload['dagw_parameter_summary'];
  }

  onPageChange(event: IPaginationEvent): void {
    this.paginationService.handlePageEvent(
      this.params,
      event,
      this.reloadHandler.bind(this)
    );
  }
}
