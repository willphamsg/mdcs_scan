import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { IDepoList } from '@app/models/depo';
import { ISystemInfo } from '@app/models/maitenance';
import { MaintenanceSharedService } from '@app/services/maintenance-shared.service';
import { Observable, of, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-system-information',
    imports: [
        MatCardModule,
        MatMenuModule,
        MatTableModule,
        CommonModule,
        MatGridListModule,
        MatExpansionModule,
    ],
    templateUrl: './system-information.component.html',
    styleUrl: './system-information.component.scss'
})
export class SystemInformationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  depot: IDepoList | null = null;
  mdcsInformation$: Observable<ISystemInfo[]> = of([]);
  dagwInformation$: Observable<ISystemInfo[]> = of([]);

  constructor(private sharedService: MaintenanceSharedService) {}

  ngOnInit(): void {
    this.mdcsInformation$ = this.sharedService.getSystemInformation('mdcs');
    this.dagwInformation$ = this.sharedService.getSystemInformation('dagw');

    this.sharedService.selectedDepot$
      .pipe(takeUntil(this.destroy$))
      .subscribe(depot => {
        if (!depot) return of([]);
        this.depot = depot;
        return depot;
        // return this.sharedService.getTaskItems(depot);
      });
  }

  ngOnDestroy(): void {
    this.sharedService.updateSelectedDepot(null);
    this.sharedService.resetFormGroup();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
