import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { FilterComponent } from '@app/components/filter/filter.component';
import { BreadcrumbsComponent } from '@app/components/layout/breadcrumbs/breadcrumbs.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { IDepoList } from '@app/models/depo';
import { IEodProcess } from '@app/models/maitenance';
import { FilterService } from '@app/services/filter.service';
import { MaintenanceSharedService } from '@app/services/maintenance-shared.service';
import { PaginationService } from '@app/services/pagination.service';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import { Observable, of, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-eod-process',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatDividerModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    BreadcrumbsComponent,
    FilterComponent,
    PaginationComponent,
  ],
  templateUrl: './eod-process.component.html',
  styleUrls: ['./eod-process.component.scss'],
})
export class EodProcessComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'taskName',
    'description',
    'startTime',
    'endTime',
    'status',
  ];
  dataSource: IEodProcess[] = [];
  paginatedData$: Observable<IFilterConfig[]> =
    this.paginationService.paginatedData$;
  depot: IDepoList | null = null;
  depotForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private sharedService: MaintenanceSharedService,
    private paginationService: PaginationService,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.sharedService.selectedDepot$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(depot => {
          if (!depot) return of([]);
          this.depot = depot;
          return this.sharedService.getTaskItems(depot);
        })
      )
      .subscribe(res => (this.dataSource = res));
  }

  ngOnDestroy(): void {
    this.sharedService.updateSelectedDepot(null);
    this.sharedService.resetFormGroup();
    this.filterService.clearSelectedFilters();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
