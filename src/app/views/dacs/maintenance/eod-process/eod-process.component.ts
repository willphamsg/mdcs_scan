import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { BreadcrumbsComponent } from '@app/components/layout/breadcrumbs/breadcrumbs.component';
import { ForceEodDialogComponent } from '@app/components/force-eod-dialog/force-eod-dialog.component';
import { IDepoList } from '@app/models/depo';
import { IPaginationEvent, IParams } from '@models/common';
import { IEodProcess } from '@app/models/maitenance';
import { FilterService } from '@app/services/filter.service';
import { MaintenanceSharedService } from '@app/services/maintenance-shared.service';
import { PaginationService } from '@app/services/pagination.service';
import { of, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { DepoService } from '@services/depo.service';
import { createFormGroup, IFilterConfig } from '@app/shared/utils/form-utils';

@Component({
    selector: 'app-eod-process',
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
        MatInputModule,
        MatSortModule,
        FormsModule,
        ReactiveFormsModule,
        BreadcrumbsComponent,
        CommonModule,
        PaginationComponent,
    ],
    templateUrl: './eod-process.component.html',
    styleUrls: ['./eod-process.component.scss']
})
export class EodProcessComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'id',
    'taskName',
    'description',
    'startTime',
    'endTime',
    'status',
  ];
  dataSource: IEodProcess[] = [];
  rowCount: number = 0;
  currentPage: number = 1;

  // TODO: Create base component for pagination
  params: IParams = {
    page_size: 10,
    page_index: 0,
    sort_order: [],
    search_text: '',
    search_select_filter: {
      depot_id: '',
    },
  };

  depotForm: FormGroup;
  depots: IDepoList[] = [];
  configs: IFilterConfig[] = [];
  isDisableForceEOD: boolean = false;

  intervalId: any;

  private destroy$ = new Subject<void>();

  constructor(
    private sharedService: MaintenanceSharedService,
    private paginationService: PaginationService,
    private filterService: FilterService,
    private depotService: DepoService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // this.sharedService.selectedDepot$
    //   .pipe(
    //     takeUntil(this.destroy$)
    //     // switchMap(depot => {
    //     //   if (!depot) return of([]);
    //     //   this.depot = depot;
    //     //   return this.sharedService.getTaskItems(depot);
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
        if (this.params.search_select_filter['depot_id'] !== formValue.depot) {
          this.params.search_select_filter['depot_id'] = formValue.depot;
          clearInterval(this.intervalId);
          this.isDisableForceEOD = false;
          this.reloadHandler();
        }
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
      {
        controlName: 'currentBusinessDate',
        value: '',
      },
      {
        controlName: 'lastEodDate',
        value: '',
      },
    ];
    this.depotForm = createFormGroup(this.configs);
  }

  reloadHandler() {
    if (!!this.params.search_select_filter['depot_id']) {
      this.sharedService
        .getTaskItems(this.params)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: value => {
            if (value.status === 200) {
              if (value.payload['forceStatus'] === 2) {
                this.isDisableForceEOD = false;
                clearInterval(this.intervalId);
              }
              this.dataSource = value.payload['eod_process'];
              this.rowCount = value.payload['records_count'];
              this.depotForm.get('currentBusinessDate')?.disable();
              this.depotForm
                .get('currentBusinessDate')
                ?.setValue(value.payload['business_date']);
              this.depotForm.get('lastEodDate')?.disable();
              this.depotForm
                .get('lastEodDate')
                ?.setValue(value.payload['last_eod_date']);
              // console.log('EOD Process Items:', this.dataSource);
            }
          },
        });
    }
  }

  sortHandler(element: Sort) {
    this.params.sort_order = [
      { name: element.active, desc: element.direction == 'asc' ? false : true },
    ];
    this.reloadHandler();
  }

  forceEOD(): void {
    const dialogRef = this.dialog.open(ForceEodDialogComponent, {
      width: '100%',
      height: '100%',
      maxHeight: '244px',
      maxWidth: '576px',
      panelClass: ['force-eod-dialog'],
      autoFocus: 'first-heading',
      disableClose: true,
      data: {},
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isForce => {
        if (isForce) {
          this.sharedService
            .forceEOD()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: value => {
                if (value.status === 200) {
                  this.isDisableForceEOD = true;
                  // Handle success message if needed
                  this.intervalId = setInterval(() => {
                    this.reloadHandler();
                  }, 5000); // Reload after 5 seconds
                }
              },
            });
        }
      });
  }

  onPageChange(event: IPaginationEvent): void {
    this.paginationService.handlePageEvent(
      this.params,
      event,
      this.reloadHandler.bind(this)
    );
  }

  ngOnDestroy(): void {
    // this.sharedService.updateSelectedDepot(null);
    // this.sharedService.resetFormGroup();
    // this.filterService.clearSelectedFilters();
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.intervalId);
  }
}
