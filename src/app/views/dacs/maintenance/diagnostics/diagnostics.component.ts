import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FilterComponent } from '@app/components/filter/filter.component';
import { BreadcrumbsComponent } from '@app/components/layout/breadcrumbs/breadcrumbs.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { IDepoList } from '@app/models/depo';
import { IStatusCategory } from '@app/models/maitenance';
import { MaintenanceSharedService } from '@app/services/maintenance-shared.service';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-diagnostics',
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
  ],
  templateUrl: './diagnostics.component.html',
  styleUrls: ['./diagnostics.component.scss'],
})
export class DiagnosticsComponent implements OnInit, OnDestroy {
  depot: IDepoList | null = null;
  categoryItems: IStatusCategory[] = [];
  private destroy$ = new Subject<void>();
  constructor(private sharedService: MaintenanceSharedService) {}

  // TODO: Create a loading screen for while waiting for api response
  ngOnInit(): void {
    this.sharedService.selectedDepot$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(depot => {
          if (!depot) return [];
          this.depot = depot;
          return this.sharedService.getDiagnositicItem(depot);
        })
      )
      .subscribe(items => {
        this.categoryItems = items;
      });
  }

  ngOnDestroy(): void {
    this.sharedService.updateSelectedDepot(null);
    this.sharedService.resetFormGroup();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
