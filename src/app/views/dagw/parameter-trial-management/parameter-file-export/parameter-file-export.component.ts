import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
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
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { ExportDialogComponent } from '@app/components/export-dialog/export-dialog.component';
import { FilterComponent } from '@app/components/filter/filter.component';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';
import { BreadcrumbsComponent } from '@app/components/layout/breadcrumbs/breadcrumbs.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { FilterService } from '@app/services/filter.service';
import { IParams, DropdownList, IPaginationEvent } from '@app/models/common';
import { IDepoList } from '@app/models/depo';
import { IFile } from '@app/models/parameter-management';
import { FileImportExportService } from '@app/services/file-import-export.service';
import { PaginationService } from '@app/services/pagination.service';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import { AppStore } from '@app/store/app.state';
import { showSnackbar } from '@app/store/snackbar/snackbar.actions';
import DummyData from '@data/db.json';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { ViewComponent } from './view/view.component';

@Component({
    selector: 'app-parameter-file-export',
    imports: [
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatExpansionModule,
        MatCheckboxModule,
        MatDividerModule,
        MatTableModule,
        MatSelectModule,
        MatSortModule,
        FormsModule,
        CommonModule,
        BreadcrumbsComponent,
        FilterComponent,
        PaginationComponent,
        SelectedFilterComponent,
    ],
    templateUrl: './parameter-file-export.component.html',
    styleUrl: './parameter-file-export.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParameterFileExportComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  paginatedData: any[] = [];
  dataSource: IFile[] = [];
  rowCount: number = 0;
  currentPage: number = 1;

  displayedColumns: string[] = [
    'id',
    // 'depot',
    'fileId',
    'parameterName',
    'version',
    'type',
    'status',
    'description',
    'chk',
  ];
  params: IParams = {
    page_size: 10,
    page_index: 0,
    sort_order: [],
    search_text: '',
    search_select_filter: {
      type: [],
    },
  };

  selection: IFile[] = [];

  depots: IDepoList[] = [];
  depotSelected: string = '';
  chkAll: boolean = false;
  filterConfigs: IFilterConfig[] = [];

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
    private paginationService: PaginationService,
    public dialog: MatDialog,
    private store: Store<AppStore>,
    private filterService: FilterService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscribeToDepoChanges();
    this.loadFilterValues();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  subscribeToDepoChanges(): void {
    const searchValue$ = this.filterService.searchValue$;
    const filterValues$ = this.filterService.filterValues$;

    combineLatest([searchValue$, filterValues$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([searchValue, filterValue]) => {
        this.params.search_text = searchValue;
        const { type } = filterValue || {};

        // TODO: Move this in service, all data manipulation should be done in service
        this.params.search_select_filter = {
          ...this.params.search_select_filter,
          type,
        };
        this.reloadHandler();
      });
  }

  handleSelectDepot(event: any) {
    this.depotSelected = event.value;
    this.dataSource = DummyData.parameter_file_export_data;
  }

  loadFilterValues(): void {
    this.filterConfigs = [
      {
        controlName: 'type',
        value: [],
        type: 'array',
        options: [
          {
            id: 'Live',
            value: 'Live',
          },
          {
            id: 'Trial',
            value: 'Trial',
          },
        ],
      },
    ];
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

  exportHandler() {
    // this.selection = this.selection.map(item => ({
    //   ...item,
    //   status: 'Exporting',
    // }));
    const selectedIds = this.selection.map(item => item.id);
    this.dataSource = this.dataSource.map(item => {
      const isSelected = this.selection.find(sel => sel.id === item.id);
      if (isSelected) {
        return {
          ...item,
          status: 'Exporting',
        };
      }
      return item;
    });

    this.importExportService.sendExportRequest(selectedIds).subscribe({
      next: value => {
        if (value.status === 200) {
          // this.updateDataSource(value.payload);
          this.cdr.detectChanges();
          this.openView(value.payload);
        }
      },
    });
  }

  openView(data: any) {
    const dialogRef = this.dialog.open(ViewComponent, {
      height: '70%',
      width: '90%',
      disableClose: true,
      data,
    });
    dialogRef.afterClosed().subscribe(() => {
      this.selection = [];
      // this.reloadHandler();

      const successFiles = data['success_files'] as any[];
      const failedFiles = data['failed_files'] as any[];

      console.log('successFiles', successFiles);
      console.log('failedFiles', failedFiles);

      this.dataSource = this.dataSource.map(item => {
        const isSuccess = successFiles.find(sel => sel.id === item.id);
        const isFailed = failedFiles.find(sel => sel.id === item.id);
        if (isSuccess) {
          return {
            ...item,
            status: 'Completed',
            description: `Export successfully`,
          };
        } else if (isFailed) {
          return {
            ...item,
            status: 'Failed',
            description: `Export failed`,
          };
        }
        return item;
      });

      this.cdr.detectChanges();
    });
  }

  checkHandler(event: MatCheckboxChange, element: IFile) {
    if (event.checked) {
      const obj: IFile = {
        id: element.id,
        version: element.version,
        // depot: element.depot,
        fileId: element.fileId,
        parameterName: element.parameterName,
        type: element.type,
        status: element.status,
        chk: element.chk,
        description: element.description,
      };
      this.selection.push(obj);
    } else {
      this.selection = this.selection.filter(x => x.id != element.id);
    }
  }

  checkAllHandler(event: MatCheckboxChange) {
    this.dataSource.map(x => (x.chk = event.checked));
    if (event.checked) {
      this.selection = this.dataSource;
      // const retain = this.params.page_size;
      // this.params.page_size = 9999;
      // if (this.params.depot != '') {
      //   this.dailyReportService.search(this.params).subscribe({
      //     next: (value: PayloadResponse) => {
      //       if (value.status == 200) {
      //         this.params.page_size = retain;
      //         const source = value.payload['daily-report'];
      //         this.selection = source.map((item: IVehicleDelete) => {
      //           return <IVehicleDelete>item;
      //         });
      //       }
      //     },
      //   });
      // }
    } else {
      this.selection = [];
    }
  }

  reloadHandler(): void {
    if (this.depots) {
      this.importExportService.search(this.params).subscribe({
        next: value => {
          if (value.status === 200) {
            this.updateDataSource(value.payload);
            this.cdr.detectChanges();
          }
        },
      });
    }
  }

  updateDataSource(payload: any): void {
    this.dataSource = payload['parameter_file_export_data'];
    this.rowCount = payload['records_count'];
    this.selection = [];
    this.chkAll = false;
  }

  sortHandler(sort: Sort): void {
    this.params.sort_order = [
      { name: sort.active, desc: sort.direction === 'asc' ? false : true },
    ];
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
