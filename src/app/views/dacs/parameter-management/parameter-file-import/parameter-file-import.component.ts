import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { FilterComponent } from '@app/components/filter/filter.component';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';
import { BreadcrumbsComponent } from '@app/components/layout/breadcrumbs/breadcrumbs.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { ClickStopPropagationDirective } from '@app/directives/click-stop-propagation.directive';
import {
  DropdownList,
  IHeader,
  IPaginationEvent,
  IParams,
} from '@app/models/common';
import { IDepoList } from '@app/models/depo';
import { IFile, IParameterTab } from '@app/models/parameter-management';
import { FileImportExportService } from '@app/services/file-import-export.service';
import { PaginationService } from '@app/services/pagination.service';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { ViewComponent } from './view/view.component';
import { FilterService } from '@app/services/filter.service';
import { DepoService } from '@app/services/depo.service';
import { Sort } from '@angular/material/sort';
import ParameterFile from '@data/parameter-file-import.json';

@Component({
  selector: 'app-parameter-file-import',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatAccordion,
    MatExpansionModule,
    MatCheckboxModule,
    MatInputModule,
    MatDividerModule,
    MatTableModule,
    MatTabsModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterModule,
    ClickStopPropagationDirective,
    BreadcrumbsComponent,
    FilterComponent,
    PaginationComponent,
    SelectedFilterComponent,
  ],
  templateUrl: './parameter-file-import.component.html',
  styleUrl: './parameter-file-import.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParameterFileImportComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  paginatedData: any[] = [];

  dataSource: IFile[] = [];
  headerData = ParameterFile;
  displayedColumns: string[] = ParameterFile.map((x: IHeader) => {
    return x.field;
  });

  depots: IDepoList[] = [];
  filterConfigs: IFilterConfig[] = [];
  rowCount: number = 0;
  importStatus: DropdownList[] = [
    {
      id: '0',
      value: 'Imported',
    },
    {
      id: '1',
      value: 'Fail',
    },
  ];

  params: IParams = {
    page_size: 10,
    page_index: 0,
    sort_order: [],
    search_text: '',
    search_select_filter: {
      depot_id: [],
      mdcsAccess: [],
    },
  };

  tabList = [
    { label: 'Import File', value: 1 },
    { label: 'Import History', key: 2 },
  ];

  depotSelected: string = '';
  tabIdx = 0;

  constructor(
    private importExportService: FileImportExportService,
    private filterService: FilterService,
    private paginationService: PaginationService,
    private depoService: DepoService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
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
        const { depots = [], mdcsAccess = [] } = filterValue || {};

        this.params.search_select_filter = {
          ...this.params.search_select_filter,
          depot_id: depots,
          mdcsAccess: mdcsAccess,
        };
        this.reloadHandler();
      });
  }

  loadFilterValues(): void {
    this.filterConfigs = [
      {
        controlName: 'depots',
        value: [],
        type: 'array',
        options: this.depots,
      },
      {
        controlName: 'mdcsAccess',
        value: [],
        type: 'array',
        options: this.importStatus,
      },
    ];
  }

  reloadHandler() {
    if (this.depots) {
      this.importExportService.search(this.params).subscribe({
        next: value => {
          if (value.status === 200) {
            this.updateDataSource(value.payload);
            this.cdr.markForCheck();
          }
        },
      });
    }
  }

  updateDataSource(payload: any): void {
    this.rowCount = payload['records_count'];
    this.dataSource = payload['parameter_file_data'];
  }

  sortHandler(element: Sort) {
    this.params.sort_order = [
      { name: element.active, desc: element.direction == 'asc' ? false : true },
    ];
    this.reloadHandler();
  }

  hiddenHandler(element: string) {
    return this.headerData.filter(x => x.field == element)[0].chk;
  }

  openView() {
    const dialogRef = this.dialog.open(ViewComponent, {
      width: '90%',
      height: '70%',
      disableClose: true,
      data: { title: 'Import Parameter' },
    });

    dialogRef.afterClosed().subscribe(bhv => {
      if (bhv === 'cancel') {
        return;
      }
      this.reloadHandler();
    });
  }

  onTabChange() {
    this.filterService.clearSelectedFilters();
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
