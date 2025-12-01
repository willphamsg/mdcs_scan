import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

import { RouterModule } from '@angular/router';
import { FilterComponent } from '@app/components/filter/filter.component';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { FilterService } from '@app/services/filter.service';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import { BreadcrumbsComponent } from '@components/layout/breadcrumbs/breadcrumbs.component';
import VehicleHeader from '@data/vehicle-header.json';
import {
  DropdownList,
  IHeader,
  IPaginationEvent,
  IParams,
  PayloadResponse,
  TDate,
} from '@models/common';
import VehicleStatus from '@data/vehicle-status.json';
import { IDepoList } from '@models/depo';
import {
  IVehicleList,
  VehicleStatusEnum,
  VehicleStatusLabelMapping,
} from '@models/vehicle-list';
import { DepoService } from '@services/depo.service';
import { MasterService } from '@services/master.service';
import { MessageService } from '@services/message.service';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { ViewComponent } from '../view/view.component';
import { PaginationService } from '@app/services/pagination.service';
import { environment } from '@env/environment';

@Component({
    selector: 'app-search',
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
        MatMenuModule,
        CommonModule,
        MatDividerModule,
        FormsModule,
        FilterComponent,
        PaginationComponent,
        SelectedFilterComponent,
    ],
    providers: [MatDatepickerModule],
    templateUrl: './vehicle-search.component.html',
    styleUrls: ['./vehicle-search.component.scss']
})
export class VehicleSearchComponent implements OnInit {
  destroy$ = new Subject<void>();

  headerData = VehicleHeader;
  displayedColumns: string[] = ['id', 'bus_num', 'effective_date', 'status'];
  status: DropdownList[] = [];
  statusOption: DropdownList[] = [];

  depots: IDepoList[] = [];
  selection: IVehicleList[] = [];
  dataSource: IVehicleList[] = [];
  rowCount: number = 0;
  currentPage: number = 1;

  params: IParams = {
    page_size: 10,
    page_index: 0,
    sort_order: [],
    search_text: '',
    search_select_filter: {
      status_list: [],
      effective_date_from: '',
      effective_date_till: '',
    },
  };

  chkAll: boolean = false;
  pageSize: number;

  chkGroup: { [key: string]: boolean } = {};

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  filterConfigs: IFilterConfig[] = [];
  constructor(
    private masterService: MasterService,
    private depoService: DepoService,
    public dialog: MatDialog,
    private filterService: FilterService,
    private paginationService: PaginationService
  ) {
    // TODO: Remove this from the constructor and create  test case for this
    this.status = VehicleStatus.map((item: any) => {
      return <DropdownList>{
        id: item.id,
        value: item.value,
      };
    });

    this.statusOption = VehicleStatus.filter(x => x.id === 4 || x.id === 5).map(
      (item: any) => {
        return <DropdownList>{
          id: item.id,
          value: item.value,
        };
      }
    );
  }

  ngOnInit() {
    // console.log(this.displayedColumns);
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
        const {
          depots = [],
          busId = [],
          status = [],
          effectiveDate = [],
        } = filterValue || {};

        // TODO: Move this in service, all data manipulation should be done in service
        this.params.search_select_filter = {
          ...this.params.search_select_filter,
          status_list: status,
          effective_date_from:
            Array.isArray(effectiveDate) && effectiveDate.length > 0
              ? new DatePipe('en-US').transform(
                  effectiveDate[0],
                  'yyyy-MM-dd HH:mm:ss'
                ) + ''
              : (effectiveDate as TDate).startDate || '',
          effective_date_till:
            Array.isArray(effectiveDate) && effectiveDate.length > 1
              ? new DatePipe('en-US').transform(
                  effectiveDate[1],
                  'yyyy-MM-dd HH:mm:ss'
                ) + ''
              : (effectiveDate as TDate).endDate || '',
        };
        this.reloadHandler();

        // if (
        //   this.depots.length > 0 &&
        //   this.depots?.length !== this.filterConfigs[0]?.options?.length
        // )
        //   this.loadFilterValues();
      });
  }

  loadFilterValues(): void {
    this.filterConfigs = [
      {
        controlName: 'effectiveDate',
        type: 'date-range',
        children: [
          { controlName: 'startDate', value: '' },
          { controlName: 'endDate', value: '' },
        ],
      },
      {
        controlName: 'status',
        value: [],
        type: 'radio',
        options: [
          { label: 'Active', value: 'Active' },
          { label: 'Future', value: 'Future' },
        ],
      },
    ];
  }

  onTabChange() {
    this.filterService.clearSelectedFilters();
    this.reloadHandler();
  }

  reloadHandler() {
    if (this.depots) {
      this.masterService.search(this.params).subscribe({
        next: (value: PayloadResponse) => {
          if (value.status == 200) {
            if (value.status === 200) {
              this.updateDataSource(value.payload);
            }
          }
        },
      });
    }
  }

  updateDataSource(payload: any): void {
    this.rowCount = payload['records_count'];
    this.dataSource = payload['master_bus_list'].map(
      this.mapBusList.bind(this)
    );
    // console.log(this.dataSource);
    this.selection = [];
    this.chkAll = false;
  }

  mapBusList(item: IVehicleList): IVehicleList {
    const depot = this.depots.find(
      _d => _d.depot_id === item.depot_id
    ) as IDepoList;
    return <IVehicleList>{
      ...item,
      depot_name: depot?.depot_name,
      status: this.status.find(x => x.id == item.status)?.value,
      updated_on: item.updated_on,
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

  checkHandler(event: MatCheckboxChange, element: IVehicleList) {
    this.selection = event.checked
      ? [...this.selection, element]
      : this.selection.filter(x => x.id !== element.id);
  }

  checkAllHandler(event: MatCheckboxChange) {
    this.chkAll = event.checked;
    this.dataSource.forEach(x => (x.chk = event.checked));

    this.selection = event.checked ? [...this.dataSource] : [];
  }

  hiddenHandler(element: string) {
    return this.headerData.filter(x => x.field == element)[0].chk;
  }

  sortHandler(element: Sort) {
    this.params.sort_order = [
      { name: element.active, desc: element.direction == 'asc' ? false : true },
    ];
    this.reloadHandler();
  }

  openView() {
    const dialogRef = this.dialog.open(ViewComponent, {
      height: '70%',
      width: '90%',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(() => {
      if (!environment.useDummyData) {
        this.reloadHandler();
      } else {
        setTimeout(() => {
          this.reloadHandler();
        }, 1000);
      }
    });
  }

  updateView(action: string) {
    const dialogRef = this.dialog.open(ViewComponent, {
      width: '90%',
      height: '70%',
      disableClose: true,
      data: {
        title: `${action === 'update' ? 'Edit' : 'Delete'} Bus Entry`,
        selection: this.selection,
        action,
      },
    });

    dialogRef.afterClosed().subscribe(bhv => {
      if (bhv === 'cancel') {
        return;
      }
      if (!environment.useDummyData) {
        this.reloadHandler();
      } else {
        setTimeout(() => {
          this.reloadHandler();
        }, 1000);
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
