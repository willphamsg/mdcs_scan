import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { FilterComponent } from '@app/components/filter/filter.component';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';
import { BreadcrumbsComponent } from '@app/components/layout/breadcrumbs/breadcrumbs.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import {
  BusRequest,
  DropdownList,
  IHeader,
  IPaginationEvent,
  PayloadResponse,
  IParams,
} from '@app/models/common';
import { PaginationService } from '@app/services/pagination.service';
import { FilterService } from '@app/services/filter.service';

import { IDepoList } from '@app/models/depo';
import { ITrialDeviceSelection } from '@app/models/parameter-trial';
import { DepoService } from '@app/services/depo.service';
import { NewParameterApprovalService } from '@app/services/new-parameter-approval.service';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import TrialDeviceSelection from '@data/trial-device-selection-header.json';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { ViewComponent } from '../view/view.component';

@Component({
    selector: 'app-trial-device-selection-search',
    templateUrl: './trial-device-selection-search.component.html',
    styleUrls: ['./trial-device-selection-search.component.scss'],
    imports: [
        BreadcrumbsComponent,
        MatSortModule,
        MatCardModule,
        MatDividerModule,
        MatTabsModule,
        MatTableModule,
        MatCheckboxModule,
        MatIconModule,
        MatButtonModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        FilterComponent,
        PaginationComponent,
        SelectedFilterComponent,
    ]
})
export class TrialDeviceSelectionSearchComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  headerData = TrialDeviceSelection;
  chkAll = false;
  tab1Columns: string[] = this.headerData.map((x: IHeader) => x.field);
  tab2Columns = [...this.tab1Columns, 'chk'];
  options: DropdownList[] = [];

  dataSource: ITrialDeviceSelection[] = [];
  selection: ITrialDeviceSelection[] = [];
  rowCount: number = 0;
  currentPage: number = 1;

  params: IParams = {
    page_size: 5,
    page_index: 0,
    sort_order: [],
    search_text: '',
    search_select_filter: {
      day_type: '',
      bus_num: '',
      svc_prov_id: '',
      depot_id: '',
      trial_group: 'Trial Device Summary',
    },
  };

  depots: IDepoList[] = [];

  filterConfigs: IFilterConfig[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  constructor(
    private newParameterApprovalService: NewParameterApprovalService,
    private depoService: DepoService,
    public dialog: MatDialog,
    private paginationService: PaginationService,
    private filterService: FilterService
  ) {}

  ngOnInit() {
    this.tab1Columns.push('chk');

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
        const { depots = [] } = filterValue || {};

        // TODO: Move this in service, all data manipulation should be done in service
        this.params.search_select_filter = {
          ...this.params.search_select_filter,
          depot_id_list: depots,
        };
        this.reloadHandler();

        if (
          this.depots.length > 0 &&
          this.depots?.length !== this.filterConfigs[0]?.options?.length
        )
          this.loadFilterValues();
      });
    // this.depoService.depoList$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((depotList: IDepoList[]) => {
    //     this.depots = depotList;
    //     this.reloadHandler();
    //   });
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
        controlName: 'trialGroup',
        value: [],
        type: 'radio',
        options: [
          { label: 'Trial', value: 'trial' },
          { label: 'Non Trial', value: 'non-trial' },
        ],
      },
      {
        controlName: 'busServiceGroup',
        value: [],
        type: 'radio',
        options: [
          { label: 'Trial', value: 'trial' },
          { label: 'Non Trial', value: 'non-trial' },
        ],
      },
      {
        controlName: 'fareParameterGroup',
        value: [],
        type: 'radio',
        options: [
          { label: 'Trial', value: 'trial' },
          { label: 'Non Trial', value: 'non-trial' },
        ],
      },
    ];
  }

  reloadHandler(): void {
    if (this.depots) {
      this.newParameterApprovalService.search(this.params).subscribe({
        next: value => {
          if (value.status === 200) {
            this.updateDataSource(value.payload);
          }
        },
      });
    }
  }

  updateDataSource(payload: any): void {
    this.rowCount = payload['records_count'];
    this.dataSource = payload['trial_device_summary_list'].map(
      this.mapDataList.bind(this)
    );
    this.selection = [];
    this.chkAll = false;
  }

  mapDataList(item: any): any {
    const depot = this.depots.find(_d => _d.depot_id === item.depot_id);
    return <any>{
      ...item,
      depot,
    };
  }

  checkboxToggle(element: any): void {
    element.chk = !element.chk;
    const matCheckboxChange: MatCheckboxChange = {
      source: {
        checked: element.chk,
      } as any,
      checked: element.chk,
    };

    this.checkHandler(matCheckboxChange, element);
  }

  onCheckAllToggle(): void {
    this.chkAll = !this.chkAll;

    this.checkAllHandler({
      source: {
        checked: this.chkAll,
      } as any,
      checked: this.chkAll,
    });
  }

  checkHandler(event: MatCheckboxChange, element: any) {
    this.selection = event.checked
      ? [...this.selection, element]
      : this.selection.filter(x => x.id !== element.id);
  }

  checkAllHandler(event: MatCheckboxChange): void {
    this.chkAll = event.checked;
    this.dataSource.forEach(x => (x.chk = event.checked));

    this.selection = event.checked ? [...this.dataSource] : [];
  }

  // selectAllItems(): void {
  //   const originalPageSize = this.params.page_size;
  //   this.params.page_size = 9999;

  //   if (this.params.depot_id) {
  //     this.newParameterApprovalService
  //       .search(this.params)
  //       .pipe(takeUntil(this.destroy$))
  //       .subscribe({
  //         next: (response: PayloadResponse) => {
  //           if (response.status === 200) {
  //             this.selection = response.payload['trial_device_summary_list'];
  //             this.params.page_size = originalPageSize;
  //           }
  //         },
  //       });
  //   }
  // }

  sortHandler(sort: Sort): void {
    this.params.sort_order = [
      { name: sort.active, desc: sort.direction === 'asc' ? false : true },
    ];
    this.reloadHandler();
  }

  headerHandler(event: MatCheckboxChange, element: IHeader) {
    this.headerData.filter(x => x.field == element.field)[0].chk =
      event.checked;
  }

  isLastRow(row: any): boolean {
    return this.dataSource[this.dataSource.length - 1] === row;
  }

  hiddenHandler(element: string) {
    return this.headerData.filter(x => x.field == element)[0].chk;
  }

  updateView() {
    const dialogRef = this.dialog.open(ViewComponent, {
      width: '95%',
      height: '70%',
      disableClose: true,
      data: {
        title: 'Edit selected record(s)',
        selection: this.selection,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result !== 'cancel') {
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
