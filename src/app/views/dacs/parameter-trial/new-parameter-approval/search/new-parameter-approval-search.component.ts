import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

import { RouterModule } from '@angular/router';
import {
  BusRequest,
  DropdownList,
  IHeader,
  IPaginationEvent,
  IParams,
  PayloadResponse,
} from '@models/common';
import { IDepoList } from '@models/depo';
import { INewParameterApproval } from '@models/parameter-trial';
import { ParameterService } from '@app/services/parameter.service';

import { MatDividerModule } from '@angular/material/divider';
import { FilterComponent } from '@app/components/filter/filter.component';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { FilterService } from '@app/services/filter.service';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import { BreadcrumbsComponent } from '@components/layout/breadcrumbs/breadcrumbs.component';
import NewParameterApprovalHeader from '@data/new-parameter-approval-header.json';
import { DepoService } from '@services/depo.service';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { ViewComponent } from '../view/view.component';
import { PaginationService } from '@app/services/pagination.service';

@Component({
  selector: 'app-new-parameter-approval-search',
  templateUrl: './new-parameter-approval-search.component.html',
  standalone: true,
  styleUrls: ['./new-parameter-approval-search.component.scss'],
  imports: [
    BreadcrumbsComponent,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    RouterModule,
    MatCheckboxModule,
    MatSortModule,
    CommonModule,
    MatDividerModule,
    FormsModule,
    FilterComponent,
    PaginationComponent,
    SelectedFilterComponent,
  ],
})
export class NewParameterApprovalSearchComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  headerData = NewParameterApprovalHeader;
  chkAll: boolean = false;
  displayedColumns: string[] = NewParameterApprovalHeader.map((x: IHeader) => {
    return x.field;
  });
  options: DropdownList[] = [];

  dataSource: INewParameterApproval[] = [];
  selection: INewParameterApproval[] = [];
  rowCount: number = 0;
  params: IParams = {
    page_size: 10,
    page_index: 0,
    sort_order: [],
    search_text: '',
    search_select_filter: {
      depot_id: [],
      status: [0],
    },
  };

  tabIdx = 0;
  depots: IDepoList[] = [];
  chkGroup: { [key: string]: boolean } = {};
  searchForm: FormGroup;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  filterConfigs: IFilterConfig[] = [];

  constructor(
    private parameterService: ParameterService,
    private depoService: DepoService,
    private filterService: FilterService,
    private paginationService: PaginationService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.subscribeToDepoChanges();
    this.loadFilterValues();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTabChange() {
    this.filterService.clearSelectedFilters();
    this.reloadHandler();
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
        const { depots = [], status = [2] } = filterValue || {};

        this.params.search_select_filter = {
          ...this.params.search_select_filter,
          depot_id: depots,
          status: status,
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
    ];
  }

  reloadHandler() {
    this.parameterService.search(this.params).subscribe({
      next: value => {
        if (value.status === 200) {
          this.updateDataSource(value.payload);
        }
      },
    });
  }

  updateDataSource(payload: any): void {
    this.rowCount = payload['records_count'];
    this.dataSource = payload['new_parameter_approval_list'].map(
      this.mapDataSource.bind(this)
    );
    this.selection = [];
    this.chkAll = false;
  }

  mapDataSource(item: INewParameterApproval): INewParameterApproval {
    const depot = this.depots.find(_d => _d.depot_id === item.depot_id);
    return <INewParameterApproval>{
      ...item,
      depot_name: depot?.depot_name,
    };
  }

  checkHandler(event: MatCheckboxChange, element: INewParameterApproval) {
    this.selection = event.checked
      ? [...this.selection, element]
      : this.selection.filter(x => x.id !== element.id);
  }

  checkAllHandler(event: MatCheckboxChange): void {
    this.chkAll = event.checked;
    this.dataSource.forEach(x => (x.chk = event.checked));

    this.selection = event.checked ? [...this.dataSource] : [];
  }

  sortHandler(element: Sort) {
    this.params.sort_order = [
      { name: element.active, desc: element.direction == 'asc' ? false : true },
    ];
    this.reloadHandler();
  }

  headerHandler(event: MatCheckboxChange, element: IHeader) {
    this.headerData.filter(x => x.field == element.field)[0].chk =
      event.checked;
  }

  hiddenHandler(element: string) {
    return this.headerData.filter(x => x.field == element)[0].chk;
  }

  updateView(action: string) {
    const dialogRef = this.dialog.open(ViewComponent, {
      width: '95%',
      height: '70%',
      disableClose: true,
      data: {
        title: `${action === 'update' ? 'Edit' : action === 'reject' ? 'Reject' : 'Approve'} Selected`,
        selection: this.selection,
        action,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (['approve', 'reject'].includes(action) && result !== 'cancel') {
        this.tabIdx = 1;
        this.reloadHandler();
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
}
