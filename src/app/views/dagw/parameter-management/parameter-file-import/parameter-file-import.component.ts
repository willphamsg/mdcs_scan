import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
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
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { FilterComponent } from '@app/components/filter/filter.component';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';
import { BreadcrumbsComponent } from '@app/components/layout/breadcrumbs/breadcrumbs.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { ClickStopPropagationDirective } from '@app/directives/click-stop-propagation.directive';
import { DropdownList } from '@app/models/common';
import { IDepoList } from '@app/models/depo';
import { IFile } from '@app/models/parameter-management';
import { FileImportExportService } from '@app/services/file-import-export.service';
import { PaginationService } from '@app/services/pagination.service';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import DummyData from '@data/db.json';
import { Subject, takeUntil } from 'rxjs';
import { ViewComponent } from './view/view.component';

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

  displayedColumns: string[] = [
    'id',
    'depot',
    'fileId',
    'parameterName',
    'version',
    'effectiveDateTime',
    'status',
    'last_update',
  ];

  depots: IDepoList[] = [];
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

  constructor(
    private importExportService: FileImportExportService,
    private paginationService: PaginationService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.dataSource = DummyData.parameter_file_data;
    this.paginationService.paginatedData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => (this.paginatedData = res));
    this.loadFilterValues();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
}
