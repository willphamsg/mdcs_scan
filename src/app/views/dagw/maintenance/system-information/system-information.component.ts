import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { DepoService } from '@services/depo.service';
import { BreadcrumbsComponent } from '@app/components/layout/breadcrumbs/breadcrumbs.component';
import { IDepoList } from '@app/models/depo';
import { ISystemInfo } from '@app/models/maitenance';
import { MaintenanceSharedService } from '@app/services/maintenance-shared.service';
import { Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { createFormGroup, IFilterConfig } from '@app/shared/utils/form-utils';

@Component({
    selector: 'app-system-information',
    imports: [
        MatCardModule,
        MatMenuModule,
        ReactiveFormsModule,
        MatTableModule,
        CommonModule,
        MatGridListModule,
        MatExpansionModule,
        MatDividerModule,
        MatSelectModule,
        BreadcrumbsComponent,
    ],
    templateUrl: './system-information.component.html',
    styleUrl: './system-information.component.scss'
})
export class SystemInformationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  depotForm!: FormGroup;
  depots: IDepoList[] = [];
  configs: IFilterConfig[] = [];

  depot_id: string = '';
  depot: IDepoList | null = null;
  // mdcsInformation$: Observable<ISystemInfo[]> = of([]);
  // dagwInformation$: Observable<ISystemInfo[]> = of([]);

  dataSource: { mdcs: ISystemInfo[]; dagw: ISystemInfo[] } = {
    mdcs: [],
    dagw: [],
  };

  constructor(
    private sharedService: MaintenanceSharedService,
    private depotService: DepoService
  ) {}

  ngOnInit(): void {
    this.reloadHandler();

    // this.mdcsInformation$ = this.sharedService.getSystemInformation('mdcs');
    // this.dagwInformation$ = this.sharedService.getSystemInformation('dagw');

    // this.sharedService.selectedDepot$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(depot => {
    //     if (!depot) return of([]);
    //     this.depot = depot;
    //     return depot;
    //     // return this.sharedService.getTaskItems(depot);
    //   });
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
    // if (!!this.depot_id) {
    this.sharedService
      .getSystemInformation(this.depot_id, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: value => {
          if (value.status === 200) {
            this.dataSource = value.payload['system_info'];
            // console.log('Diagnostic Items:', this.categoryItems);
          }
        },
      });
    // }
  }

  ngOnDestroy(): void {
    this.sharedService.updateSelectedDepot(null);
    this.sharedService.resetFormGroup();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
