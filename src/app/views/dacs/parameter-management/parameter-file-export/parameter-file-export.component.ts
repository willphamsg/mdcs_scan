import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
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
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { ExportDialogComponent } from '@app/components/export-dialog/export-dialog.component';
import { FilterComponent } from '@app/components/filter/filter.component';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';
import { BreadcrumbsComponent } from '@app/components/layout/breadcrumbs/breadcrumbs.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { DropdownList } from '@app/models/common';
import { IDepoList } from '@app/models/depo';
import { IFile } from '@app/models/parameter-management';
import { FileImportExportService } from '@app/services/file-import-export.service';
import { PaginationService } from '@app/services/pagination.service';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import { AppStore } from '@app/store/app.state';
import { showSnackbar } from '@app/store/snackbar/snackbar.actions';
import DummyData from '@data/db.json';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

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
  params: IFile = {
    id: 0,
    // depot: '',
    fileId: '',
    parameterName: '',
    version: '',
    type: '',
    status: '',
    description: '',
    chk: false,
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
    private store: Store<AppStore>
  ) {}

  ngOnInit(): void {
    this.dataSource = [];
    this.loadFilterValues();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleSelectDepot(event: any) {
    this.depotSelected = event.value;
    this.dataSource = DummyData.parameter_file_export_data;
  }

  loadFilterValues(): void {
    this.importExportService
      .getDepotService('')
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.depots = res;

        this.filterConfigs = [
          {
            controlName: 'type',
            value: [],
            type: 'array',
            options: [
              {
                id: '0',
                value: 'Live',
              },
              {
                id: '1',
                value: 'Trial',
              },
            ],
          },
          // {
          //   controlName: 'mdcsAccess',
          //   value: [],
          //   type: 'array',
          //   options: this.exportStatus,
          // },
        ];
      });
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
}
