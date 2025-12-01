import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { FilterComponent } from '@app/components/filter/filter.component';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';
import { BreadcrumbsComponent } from '@app/components/layout/breadcrumbs/breadcrumbs.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { IParams, IPaginationEvent, TDate } from '@app/models/common';
import { IDepoList } from '@app/models/depo';
import { IAudtitLog } from '@app/models/maitenance';
import { DepoService } from '@app/services/depo.service';
import { MaintenanceSharedService } from '@app/services/maintenance-shared.service';
import { PaginationService } from '@app/services/pagination.service';
import { FilterService } from '@app/services/filter.service';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { types } from 'util';
import e from 'express';

@Component({
    selector: 'app-audit-log',
    imports: [
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatExpansionModule,
        MatCheckboxModule,
        MatDividerModule,
        MatTableModule,
        MatSortModule,
        FormsModule,
        CommonModule,
        BreadcrumbsComponent,
        FilterComponent,
        PaginationComponent,
        SelectedFilterComponent,
    ],
    templateUrl: './audit-log.component.html',
    styleUrl: './audit-log.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuditLogComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'id',
    'depot',
    'userId',
    'dateTime',
    'updateType',
    'description',
  ];

  dataSource: IAudtitLog[];
  rowCount: number = 0;
  currentPage: number = 1;
  depots: IDepoList[] = [];
  types: string[] = [];

  params: IParams = {
    page_size: 10,
    page_index: 0,
    sort_order: [],
    search_text: '',
    search_select_filter: {
      depot_id_list: [],
      user_id: '',
      update_type: [],
      date_from: '',
      date_till: '',
      types: [],
    },
  };

  filterConfigs: IFilterConfig[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private sharedService: MaintenanceSharedService,
    private paginationService: PaginationService,
    private depotService: DepoService,
    private filterService: FilterService,
    private cdr: ChangeDetectorRef
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
    const depotList$ = this.depotService.depoList$;
    const searchValue$ = this.filterService.searchValue$;
    const filterValues$ = this.filterService.filterValues$;

    combineLatest([depotList$, searchValue$, filterValues$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([depotList, searchValue, filterValue]) => {
        this.params.search_text = searchValue;
        this.depots = depotList;
        const {
          depots = [],
          userId = [],
          date = [],
          updateType = [],
        } = filterValue || {};

        // TODO: Move this in service, all data manipulation should be done in service
        this.params.search_select_filter = {
          ...this.params.search_select_filter,
          depot_id_list: depots,
          user_id: userId,
          date_from:
            Array.isArray(date) && date.length > 0
              ? new DatePipe('en-US').transform(
                  date[0],
                  'yyyy-MM-dd HH:mm:ss'
                ) + ''
              : (date as TDate).startDate || '',
          date_till:
            Array.isArray(date) && date.length > 1
              ? new DatePipe('en-US').transform(
                  date[1],
                  'yyyy-MM-dd HH:mm:ss'
                ) + ''
              : (date as TDate).endDate || '',
          update_type: updateType,
        };
        this.reloadHandler();

        if (
          this.depots.length > 0 &&
          this.depots?.length !== this.filterConfigs[0]?.options?.length
        )
          this.loadFilterValues();
      });

    // depotList$.pipe(takeUntil(this.destroy$)).subscribe(depotList => {
    //   this.depots = depotList;
    //   this.reloadHandler();

    //   if (
    //     this.depots.length > 0 &&
    //     this.depots?.length !== this.filterConfigs[0]?.options?.length
    //   )
    //     this.loadFilterValues();
    // });
  }

  reloadHandler(): void {
    this.sharedService.search(this.params).subscribe({
      next: value => {
        if (value.status === 200) {
          this.updateDataSource(value.payload);
        }
      },
    });
  }

  updateDataSource(payload: any): void {
    // console.log('Audit Log Items Payload:', payload['audit_log_items']);
    this.rowCount = payload['records_count'];
    this.dataSource = payload['audit_log_items'].map(
      this.mapAuditLogItems.bind(this)
    );
    this.cdr.detectChanges();

    // console.log('  this.dataSource :', this.dataSource);
  }

  mapAuditLogItems(item: IAudtitLog): IAudtitLog {
    const depot = this.depots.find(_d => _d.depot_id === item.depot_id);
    return <IAudtitLog>{
      ...item,
      depot,
    };
  }

  loadFilterValues(): void {
    this.sharedService
      .getUpdateTypeItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe(updateTypes => {
        this.filterConfigs = [
          {
            controlName: 'depots',
            value: [],
            type: 'array',
            options: this.depots,
          },
          {
            controlName: 'userId',
            value: '',
            type: 'control',
          },
          {
            controlName: 'date',
            type: 'date-range',
            children: [
              { controlName: 'startDate', value: '' },
              { controlName: 'endDate', value: '' },
            ],
          },
          {
            controlName: 'updateType',
            value: [],
            type: 'array',
            options: updateTypes,
          },
        ];
      });
  }

  sortHandler(element: Sort) {
    this.params.sort_order = [
      { name: element.active, desc: element.direction == 'asc' ? false : true },
    ];
    this.reloadHandler();
  }

  onCheckboxChange(type: string, event: any): void {
    if (event?.checked && !this.types.includes(type)) {
      this.types.push(type);
    } else if (!event?.checked) {
      this.types = this.types.filter(t => t !== type);
    }
    this.params.search_select_filter = {
      ...this.params.search_select_filter,
      types: this.types,
    };
    this.reloadHandler();
  }

  onPageChange(event: IPaginationEvent): void {
    this.paginationService.handlePageEvent(
      this.params,
      event,
      this.reloadHandler.bind(this)
    );
  }
}
