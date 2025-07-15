import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ExportDialogComponent } from '@app/components/export-dialog/export-dialog.component';
import { FilterComponent } from '@app/components/filter/filter.component';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';
import { BreadcrumbsComponent } from '@app/components/layout/breadcrumbs/breadcrumbs.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import {
  DropdownList,
  IHeader,
  IPaginationEvent,
  IParams,
} from '@app/models/common';
import { IDepoList } from '@app/models/depo';
import { IFile } from '@app/models/parameter-management';
import { DepoService } from '@app/services/depo.service';
import { FileImportExportService } from '@app/services/file-import-export.service';
import { FilterService } from '@app/services/filter.service';
import { PaginationService } from '@app/services/pagination.service';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import { AppStore } from '@app/store/app.state';
import { showSnackbar } from '@app/store/snackbar/snackbar.actions';
import DummyData from '@data/db.json';
import ParameterFile from '@data/parameter-file-export.json';
import { Store } from '@ngrx/store';
import { combineLatest, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-parameter-file-export',
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
  templateUrl: './parameter-file-export.component.html',
  styleUrl: './parameter-file-export.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParameterFileExportComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  paginatedData: any[] = [];
  dataSource: IFile[] = [];

  headerData = ParameterFile;
  displayedColumns: string[] = ParameterFile.map((x: IHeader) => {
    return x.field;
  });

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

  selection: IFile[] = [];

  depots: IDepoList[] = [];
  chkAll: boolean = false;
  filterConfigs: IFilterConfig[] = [];
  rowCount: number = 0;
  exportStatus: DropdownList[] = [
    {
      id: '0',
      value: 'Exported',
    },
    {
      id: '1',
      value: 'Fail',
    },
  ];

  constructor(
    private importExportService: FileImportExportService,
    private filterService: FilterService,
    private paginationService: PaginationService,
    private depoService: DepoService,
    private cdr: ChangeDetectorRef,
    private store: Store<AppStore>,
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

  downloadHandler() {
    this.dialog.open(ExportDialogComponent, {
      width: '100%',
      height: '100%',
      maxHeight: '266px',
      maxWidth: '420px',
      panelClass: ['download-dialog'],
      autoFocus: 'first-heading',
      disableClose: true,
      data: {
        type: 'export',
      },
    });

    setTimeout(() => {
      this.dialog.closeAll();

      this.store.dispatch(
        showSnackbar({
          message: `2 records have been successfully exported!`,
          title: 'Success',
          typeSnackbar: 'success',
        })
      );
    }, 5000);
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

  checkHandler(event: MatCheckboxChange, element: IFile) {
    this.selection = event.checked
      ? [...this.selection, element]
      : this.selection.filter(x => x.id !== element.id);
  }

  checkAllHandler(event: MatCheckboxChange): void {
    this.chkAll = event.checked;
    this.dataSource.forEach(x => (x.chk = event.checked));

    this.selection = event.checked ? [...this.dataSource] : [];
  }
}
