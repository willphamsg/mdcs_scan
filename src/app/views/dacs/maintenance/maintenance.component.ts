import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FilterComponent } from '@app/components/filter/filter.component';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';
import { BreadcrumbsComponent } from '@app/components/layout/breadcrumbs/breadcrumbs.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { DropdownList } from '@app/models/common';
import { IDepoList } from '@app/models/depo';
import { DagwParameterSummaryService } from '@app/services/dagw-parameter-summary.service';
import { MaintenanceSharedService } from '@app/services/maintenance-shared.service';
import { createFormGroup, IFilterConfig } from '@app/shared/utils/form-utils';
import { Subject, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [
    MatTableModule,
    MatCardModule,
    MatToolbarModule,
    MatTabsModule,
    MatMenuModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    PaginationComponent,
    FilterComponent,
    RouterModule,
    BreadcrumbsComponent,
    ReactiveFormsModule,
    FilterComponent,
    SelectedFilterComponent,
  ],
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaintenanceComponent implements OnInit, OnDestroy {
  depots: IDepoList[] = [];
  depotForm!: FormGroup;
  depotConfig: IFilterConfig[] = [];
  filterConfigs: IFilterConfig[] = [];
  currentPath: string = '';
  selectedDepot: IDepoList | null = null;

  private destroy$ = new Subject<void>();

  statusFilter: DropdownList[] = [
    { id: '0', value: 'Completed' },
    { id: '1', value: 'Failed' },
  ];

  // TODO: Optimize child components form. Update/Remove unnecessary code
  constructor(
    private dagwService: DagwParameterSummaryService,
    private sharedService: MaintenanceSharedService,
    private route: ActivatedRoute
  ) {}

  get depotValue(): string {
    return this.depotForm?.get('depots')?.value;
  }

  ngOnInit(): void {
    this.sharedService.formGroup$
      .pipe(takeUntil(this.destroy$))
      .subscribe(form => {
        if (form) {
          this.depotForm = form;
        }
      });
    this.loadDepotsAndInitForm();
    this.initFilterConfigs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDepotsAndInitForm(): void {
    this.dagwService
      .getDepotService('')
      .pipe(
        takeUntil(this.destroy$),
        switchMap(depots => {
          this.depots = depots;
          this.initDepotForm();
          return this.depotForm.valueChanges;
        })
      )
      .subscribe(formValue => {
        this.selectedDepot =
          this.depots.find(({ depot_id }) => depot_id === formValue.depots) ??
          null;
        if (this.selectedDepot) {
          this.sharedService.updateSelectedDepot(this.selectedDepot);
        }
      });
  }

  initDepotForm(): void {
    this.depotConfig = [
      {
        controlName: 'depots',
        value: '',
        type: 'select',
        options: this.depots,
      },
    ];

    this.sharedService.setFormGroup(createFormGroup(this.depotConfig));
  }

  initFilterConfigs(): void {
    this.filterConfigs = [
      {
        controlName: 'status',
        value: [],
        type: 'array',
        options: this.statusFilter,
      },
      {
        controlName: 'currDate',
        value: '',
        type: 'date-picker',
      },
      {
        controlName: 'eodExecuted',
        value: '',
        type: 'date-picker',
      },
    ];
  }

  getPageTitle(): string {
    const path = this.route.snapshot.firstChild?.routeConfig?.path;
    if (!path) return '';

    const titles: { [key: string]: string } = {
      'maintenance/diagnostics': 'Diagnostics',
      'maintenance/eod-process': 'EOD Process',
      'maintenance/system-information': 'System Information',
    };

    return titles[path] || '';
  }
}
