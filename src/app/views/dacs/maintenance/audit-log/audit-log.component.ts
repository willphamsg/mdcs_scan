import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FilterComponent } from '@app/components/filter/filter.component';
import { BreadcrumbsComponent } from '@app/components/layout/breadcrumbs/breadcrumbs.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { MaintenanceSharedService } from '@app/services/maintenance-shared.service';
import { PaginationService } from '@app/services/pagination.service';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import { DagwParameterSummaryComponent } from '../../parameter-management/dagw-parameter-summary/dagw-parameter-summary.component';
import { DagwParameterSummaryService } from '@app/services/dagw-parameter-summary.service';
import { IDepoList } from '@app/models/depo';
import { map, Subject, switchMap, takeUntil } from 'rxjs';
import { IUpdateType } from '@app/models/maitenance';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatDividerModule,
    MatTableModule,
    FormsModule,
    CommonModule,
    BreadcrumbsComponent,
    FilterComponent,
    PaginationComponent,
    SelectedFilterComponent,
  ],
  templateUrl: './audit-log.component.html',
  styleUrl: './audit-log.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditLogComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'id',
    'depot',
    'userId',
    'dateTime',
    'startDate',
    'endDate',
    'updateType',
    'description',
  ];

  paginatedData$: any;
  dataSource$: any;

  filterConfigs: IFilterConfig[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private sharedService: MaintenanceSharedService,
    private paginationService: PaginationService,
    private dagwParameterSummaryService: DagwParameterSummaryService
  ) {}

  ngOnInit(): void {
    this.dataSource$ = this.sharedService.getAuditLogItems();
    this.paginatedData$ = this.paginationService.paginatedData$;

    this.loadFilterValues();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFilterValues(): void {
    this.dagwParameterSummaryService
      .getDepotService('')
      .pipe(
        switchMap((depots: IDepoList[]) => {
          return this.sharedService.getUpdateTypeItems().pipe(
            takeUntil(this.destroy$),
            map((updateTypes: IUpdateType[]) => ({
              depots,
              updateTypes,
            }))
          );
        })
      )
      .subscribe(({ depots, updateTypes }) => {
        this.filterConfigs = [
          {
            controlName: 'depots',
            value: [],
            type: 'array',
            options: depots,
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
}
