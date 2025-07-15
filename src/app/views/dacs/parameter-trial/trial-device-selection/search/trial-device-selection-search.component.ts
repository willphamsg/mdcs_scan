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
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
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
  IParams,
  PayloadResponse,
} from '@app/models/common';
import { IDepoList } from '@app/models/depo';
import { ITrialDeviceSelection } from '@app/models/parameter-trial';
import { DepoService } from '@app/services/depo.service';
import { FilterService } from '@app/services/filter.service';
import { ParameterService } from '@app/services/parameter.service';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import TrialDeviceSelection from '@data/trial-device-selection-header.json';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { ViewComponent } from '../view/view.component';
import { TrialDeviceSelectionService } from '@app/services/trial-device-selection.service';
import { PaginationService } from '@app/services/pagination.service';

@Component({
  selector: 'app-trial-device-selection-search',
  templateUrl: './trial-device-selection-search.component.html',
  standalone: true,
  styleUrls: ['./trial-device-selection-search.component.scss'],
  imports: [
    BreadcrumbsComponent,
    MatPaginator,
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
  ],
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
  depots: IDepoList[] = [];
  trialGroups: DropdownList[] = [
    { id: 'bus_service', value: 'Bus Service Group' },
    { id: 'fare_parameter', value: 'Fare Parameter Group' },
  ];
  statuses: DropdownList[] = [
    { id: 'trial', value: 'Trial' },
    { id: 'non_trial', value: 'Non-Trial' },
  ];
  pageSize = 50;

  tabListKeys = {
    trial_device_summary: 'trial_device_summary',
    application_trial_group: 'application_trial_group',
    bus_service_group: 'bus_service_group',
    fare_parameter_group: 'fare_parameter_group',
  };

  tabLists = [
    {
      label: 'Trial Device Summary',
      key: this.tabListKeys.trial_device_summary,
    },
    {
      label: 'Application Trial Group',
      key: this.tabListKeys.application_trial_group,
    },
    { label: 'Bus Service Group', key: this.tabListKeys.bus_service_group },
    {
      label: 'Fare Parameter Group',
      key: this.tabListKeys.fare_parameter_group,
    },
  ];

  tabIdx = 0;

  filterConfigs: IFilterConfig[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  constructor(
    private trialDeviceSelectionService: TrialDeviceSelectionService,
    private depoService: DepoService,
    private filterService: FilterService,
    private paginationService: PaginationService,
    public dialog: MatDialog
  ) {}

  // ngOnInit() {
  //   this.tab1Columns.push('chk');

  //   this.subscribeToDepoChanges();
  //   this.loadFilterValues();
  // }

  ngOnInit(): void {
    this.subscribeToDepoChanges();
    this.loadFilterValues();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // subscribeToDepoChanges(): void {
  //   this.depoService.depo$
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe((value: string) => {
  //       // this.params.depot_id = value;
  //       this.reloadHandler();
  //     });

  //   this.depoService?.depoList$?.pipe(takeUntil(this.destroy$)).subscribe({
  //     next: (val: IDepoList[]) => (this.depots = val),
  //   });
  // }

  // loadFilterValues(): void {
  //   this.filterConfigs = [
  //     {
  //       controlName: 'depots',
  //       value: [],
  //       type: 'array',
  //       options: this.depots,
  //     },
  //   ];
  // }

  subscribeToDepoChanges(): void {
    const depotList$ = this.depoService.depoList$;
    const searchValue$ = this.filterService.searchValue$;
    const filterValues$ = this.filterService.filterValues$;

    combineLatest([depotList$, searchValue$, filterValues$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([depotList, searchValue, filterValue]) => {
        this.params.search_text = searchValue;
        this.depots = depotList;
        const { depots = [], status = [0] } = filterValue || {};

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

  // onTabChange(event: MatTabChangeEvent): void {
  //   this.filterService.clearSelectedFilters();
  //   // this.params.trial_group = event.tab.textLabel;
  //   this.reloadHandler();
  // }

  onTabChange() {
    this.filterService.clearSelectedFilters();
    this.reloadHandler();
  }

  reloadHandler() {
    if (this.depots) {
      this.trialDeviceSelectionService.search(this.params).subscribe({
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

  isLastRow(row: any): boolean {
    return this.dataSource[this.dataSource.length - 1] === row;
  }

  hiddenHandler(element: string) {
    return this.headerData.filter(x => x.field == element)[0].chk;
  }

  onPageChange(event: IPaginationEvent): void {
    this.paginationService.handlePageEvent(
      this.params,
      event,
      this.reloadHandler.bind(this)
    );
  }

  // reloadHandler(): void {
  //   // if (this.params.depot_id) {
  //   //   this.fetchTrialDeviceSummary();
  //   // }
  // }

  // fetchTrialDeviceSummary(): void {
  //   this.parameterService
  //     .search(this.params)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (response: PayloadResponse) => {
  //         if (response.status === 200) {
  //           this.dataSource = response.payload['trial_device_summary_list'].map(
  //             (item: ITrialDeviceSelection) => ({
  //               ...item,
  //               chk: false,
  //             })
  //           );
  //           this.selection = [];
  //           this.chkAll = false;
  //         }
  //       },
  //     });
  // }

  // checkHandler(event: MatCheckboxChange, element: ITrialDeviceSelection): void {
  //   this.selection = event.checked
  //     ? [...this.selection, element]
  //     : this.selection.filter(x => x.id !== element.id);
  // }

  // checkAllHandler(event: MatCheckboxChange): void {
  //   this.chkAll = event.checked;
  //   this.dataSource.forEach(x => (x.chk = event.checked));

  //   this.selection = event.checked ? [...this.dataSource] : [];
  // }

  // selectAllItems(): void {
  //   const originalPageSize = this.params.page_size;
  //   this.params.page_size = 9999;

  //   // if (this.params.depot_id) {
  //   //   this.newParameterApprovalService
  //   //     .search(this.params)
  //   //     .pipe(takeUntil(this.destroy$))
  //   //     .subscribe({
  //   //       next: (response: PayloadResponse) => {
  //   //         if (response.status === 200) {
  //   //           this.selection = response.payload['trial_device_summary_list'];
  //   //           this.params.page_size = originalPageSize;
  //   //         }
  //   //       },
  //   //     });
  //   // }
  // }

  // sortHandler(sort: Sort): void {
  //   this.params.sort_order = [
  //     { name: sort.active, desc: sort.direction === 'asc' ? false : true },
  //   ];
  //   this.reloadHandler();
  // }

  // headerHandler(event: MatCheckboxChange, element: IHeader) {
  //   this.headerData.filter(x => x.field == element.field)[0].chk =
  //     event.checked;
  // }

  // hiddenHandler(element: string) {
  //   return this.headerData.filter(x => x.field == element)[0].chk;
  // }

  updateView(action: string) {
    const dialogRef = this.dialog.open(ViewComponent, {
      width: '95%',
      height: '70%',
      disableClose: true,
      data: {
        title: action === 'toggle' ? 'Toggle Status' : '',
        selection: this.selection,
        action,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result !== 'cancel' && action === 'trial') {
          this.reloadHandler();
        }
      });
  }
}
