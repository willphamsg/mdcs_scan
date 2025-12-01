import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FilterComponent } from '@app/components/filter/filter.component';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';
import { BreadcrumbsComponent } from '@app/components/layout/breadcrumbs/breadcrumbs.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import {
  DropdownList,
  PayloadResponse,
  IPaginationEvent,
} from '@app/models/common';
import { IDepoList } from '@app/models/depo';
import { IFile } from '@app/models/parameter-management';
import { MessageImportExportService } from '@app/services/message-import-export.service';
import { PaginationService } from '@app/services/pagination.service';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import DummyData from '@data/db.json';
import { Subject, takeUntil } from 'rxjs';
import { AppStore } from '@app/store/app.state';
import { Store } from '@ngrx/store';
import { showSnackbar } from '@app/store/snackbar/snackbar.actions';
import { ViewComponent } from './view/view.component';
import {
  CommonDialogComponent,
  ConfirmDialogModel,
} from '@app/components/common-dialog/common-dialog.component';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
    selector: 'app-message-file-import',
    imports: [
        MatCardModule,
        MatIconModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatExpansionModule,
        MatCheckboxModule,
        MatInputModule,
        MatDividerModule,
        MatTableModule,
        MatSelectModule,
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
        RouterModule,
        BreadcrumbsComponent,
        PaginationComponent,
        MatDatepickerModule,
    ],
    providers: [provideNativeDateAdapter()],
    templateUrl: './message-file-import.component.html',
    styleUrl: './message-file-import.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageFileImportComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  paginatedData: any[] = [];

  dataSource: IFile[] = [];
  rowCount: number = 0;
  currentPage: number = 1;

  displayedColumns: string[] = [
    'id',
    'messageDataFileName',
    'busNo',
    'sequenceNo',
    'creationDateTime',
    'messageData',
    'status',
    'description',
  ];

  depots: IDepoList[] = [];
  dateSelected: string = '';

  filterConfigs: IFilterConfig[] = [];

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
  intervalId: any;
  apiCounter: number = 0;

  constructor(
    private importExportService: MessageImportExportService,
    private paginationService: PaginationService,
    public dialog: MatDialog,
    private store: Store<AppStore>,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.dataSource = [];
    this.paginationService.paginatedData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => (this.paginatedData = res));
    this.loadFilterValues();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  importHandler(event: any) {
    if (event.target.files.length) {
      const fileList = event.target.files;
      const formData = new FormData();
      // const itemGroup = this.items.at(index) as FormGroup;
      // const fileNameControl = itemGroup.get('fileName');
      for (let index = 0; index < fileList.length; index++) {
        formData.append('file', fileList[index]);
      }
      this.forceImport(formData);
    }
  }

  forceImport(formData: FormData): void {
    const dialogRef = this.dialog.open(CommonDialogComponent, {
      width: '100%',
      height: '100%',
      maxHeight: '264px',
      maxWidth: '576px',
      panelClass: ['force-eod-dialog'],
      autoFocus: 'first-heading',
      disableClose: true,
      data: new ConfirmDialogModel(
        'Confirmation',
        'By clicking "Yes", the selected file will be imported.',
        [],
        false,
        'No',
        'Yes'
      ),
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isForce => {
        if (isForce) {
          this.intervalId = setInterval(() => {
            this.apiCounter++;
            this.triggerImport(formData, this.apiCounter);
          }, 1000);
        }
      });
  }

  triggerImport(formData: FormData, count: number): void {
    if (this.apiCounter === 4) {
      clearInterval(this.intervalId);
      return;
    }
    this.importExportService
      .import(formData, count, this.dateSelected)
      .subscribe({
        next: (value: PayloadResponse) => {
          this.dataSource = value.payload['parameter_file_data'];
          this.rowCount = value.payload['records_count'];
          this.cdr.detectChanges();
          // if (value.status == 201) {
          //   this.store.dispatch(
          //     showSnackbar({
          //       message: value.message,
          //       title: 'Success',
          //       typeSnackbar: 'success',
          //     })
          //   );
          // } else {
          //   this.store.dispatch(
          //     showSnackbar({
          //       message: value.message,
          //       title: 'Error',
          //       typeSnackbar: 'error',
          //     })
          //   );
          // }
        },
      });
  }

  loadFilterValues(): void {
    this.importExportService
      .getDepotService('')
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.depots = res;

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
      });
  }

  openView() {
    const dialogRef = this.dialog.open(ViewComponent, {
      width: '90%',
      height: '70%',
      disableClose: true,
      data: { title: 'Import Parameter' },
    });
  }

  handleChangeDate(event: any) {
    this.dateSelected = event.value;
  }

  onPageChange(event: IPaginationEvent): void {
    // this.paginationService.handlePageEvent(
    //   this.params,
    //   event,
    //   this.reloadHandler.bind(this)
    // );
  }
}
