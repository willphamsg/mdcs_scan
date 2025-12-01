import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { FilterComponent } from '@app/components/filter/filter.component';
import { BreadcrumbsComponent } from '@app/components/layout/breadcrumbs/breadcrumbs.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { IDepoList } from '@app/models/depo';
import { IStatusCategory } from '@app/models/maitenance';
import { MaintenanceSharedService } from '@app/services/maintenance-shared.service';
import { DepoService } from '@services/depo.service';

import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { A11yModule } from '@angular/cdk/a11y';
import { createFormGroup, IFilterConfig } from '@app/shared/utils/form-utils';

@Component({
    selector: 'app-diagnostics',
    imports: [
        MatTableModule,
        MatCardModule,
        MatSelectModule,
        MatTabsModule,
        MatMenuModule,
        MatDividerModule,
        CommonModule,
        ReactiveFormsModule,
        BreadcrumbsComponent,
        A11yModule,
    ],
    templateUrl: './diagnostics.component.html',
    styleUrls: ['./diagnostics.component.scss']
})
export class DiagnosticsComponent implements OnInit, OnDestroy {
  depotForm!: FormGroup;
  depots: IDepoList[] = [];
  configs: IFilterConfig[] = [];

  depot_id: string = '';
  categoryItems: IStatusCategory[] = [];
  private destroy$ = new Subject<void>();
  constructor(
    private sharedService: MaintenanceSharedService,
    private depotService: DepoService
  ) {}

  // TODO: Create a loading screen for while waiting for api response
  ngOnInit(): void {
    // this.sharedService.selectedDepot$
    //   .pipe(
    //     takeUntil(this.destroy$)
    //     // switchMap(depot => {
    //     //   if (!depot) return [];
    //     //   this.depot = depot;
    //     //   return this.depot.depot_id;
    //     // })
    //   )
    //   .subscribe(depot => {
    //     if (!depot) return;
    //     this.depot = depot;
    //     this.reloadHandler();
    //   });
    this.loadSelections();
  }

  loadSelections(): void {
    this.depotService.depoList$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(depots => {
          this.depots = depots;
          this.loadConfigs();
          return this.depotForm.valueChanges;
        })
      )
      .subscribe(formValue => {
        // console.log('Diagnostics Form Value:', formValue);
        this.depot_id = formValue.depot;
        this.reloadHandler();
      });
  }

  loadConfigs(): void {
    this.configs = [
      {
        controlName: 'depot',
        value: '',
        type: 'select',
        options: this.depots,
        validators: [Validators.required],
      },
    ];
    this.depotForm = createFormGroup(this.configs);
  }

  reloadHandler() {
    if (!!this.depot_id) {
      this.sharedService
        .getDiagnosticItem(this.depot_id, false)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: value => {
            if (value.status === 200) {
              this.categoryItems = value.payload['diagnostics'];
              // console.log('Diagnostic Items:', this.categoryItems);
            }
          },
        });
    }
  }

  ngOnDestroy(): void {
    this.sharedService.updateSelectedDepot(null);
    this.sharedService.resetFormGroup();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
