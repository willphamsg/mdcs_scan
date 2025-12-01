import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { IBustList } from '@models/bus-list';
import {
  DropdownList,
  IHeader,
  IPaginationEvent,
  IParams,
} from '@models/common';
import { IDepoList } from '@models/depo';
import { ManageDailyBusListService } from '@services/manage-daily-bus-list.service';
import { MatDividerModule } from '@angular/material/divider';
import { FilterComponent } from '@app/components/filter/filter.component';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { FilterService } from '@app/services/filter.service';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import { BreadcrumbsComponent } from '@components/layout/breadcrumbs/breadcrumbs.component';
import BusHeader from '@data/bus-header.json';
import DayType from '@data/day-type.json';
import { DepoService } from '@services/depo.service';
import { combineLatest, Observable, of, Subject, takeUntil } from 'rxjs';
import { ViewComponent } from '../view/view.component';
import { PaginationService } from '@app/services/pagination.service';
import { environment } from '@env/environment';

@Component({
    selector: 'app-search',
    templateUrl: './bus-search.component.html',
    styleUrls: ['./bus-search.component.scss'],
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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusSearchComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  paginatedData$: Observable<IBustList[]> = of([]);

  headerData = BusHeader;
  chkAll: boolean = false;
  displayedColumns: string[] = BusHeader.map((x: IHeader) => {
    return x.field;
  });
  depots: IDepoList[] = [];

  options: DropdownList[] = [];
  dataSource: IBustList[] = [];

  selection: IBustList[] = [];
  rowCount: number = 0;
  currentPage: number = 1;

  // TODO: Create base component for pagination
  params: IParams = {
    page_size: 10,
    page_index: 0,
    sort_order: [],
    search_text: '',
    search_select_filter: {
      depot_id_list: [],
      day_type_list: [],
    },
  };

  filteredOptions: DropdownList[] = [];
  pageSize: number;

  chkGroup: { [key: string]: boolean } = {};
  operators: DropdownList[] = [
    { id: '1', value: 'SBSTransit' },
    { id: '2', value: 'Go Ahead Singapore' },
  ];
  statuses: DropdownList[] = [
    { id: 'approved', value: 'Approved' },
    { id: 'rejected', value: 'Rejected' },
  ];

  searchForm: FormGroup;

  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  filterConfigs: IFilterConfig[] = [];

  constructor(
    private manageDailyBusListService: ManageDailyBusListService,
    private depoService: DepoService,
    public dialog: MatDialog,
    private filterService: FilterService,
    private paginationService: PaginationService,
    private cdr: ChangeDetectorRef
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
        const {
          depot = [],
          dayType = [],
          busId = [],
          serviceNo = [],
        } = filterValue || {};

        this.params.search_select_filter = {
          ...this.params.search_select_filter,
          depot_id_list: depot,
          day_type_list: dayType,
          // bus_num: Array.isArray(busId) ? busId.join('') : busId,
          // service_num: Array.isArray(serviceNo)
          //   ? serviceNo.join('')
          //   : serviceNo,
        };

        // Reset page when new filter/search happens
        this.paginationService.currentPage = 1;
        this.params.page_index = 0;
        this.currentPage = 1;

        this.reloadHandler();
        if (
          this.depots.length > 0 &&
          this.depots?.length !== this.filterConfigs[0]?.options?.length
        )
          this.loadFilterValues();
      });
  }

  loadFilterValues(): void {
    this.options = DayType.map((item: any) => {
      return <DropdownList>{
        id: item.id,
        value: item.value,
      };
    });

    this.filterConfigs = [
      {
        controlName: 'depot',
        value: [],
        type: 'array',
        options: this.depots,
      },
      {
        controlName: 'dayType',
        value: [],
        type: 'array',
        options: this.options,
      },
      // {
      //   controlName: 'serviceNo',
      //   value: [],
      //   type: 'array',
      //   options: this.filteredOptions,
      // },
      // {
      //   controlName: 'serviceNo',
      //   value: '',
      //   type: 'control',
      // },
      // {
      //   controlName: 'busId',
      //   value: '',
      //   type: 'control',
      // },
    ];
  }

  reloadHandler() {
    if (this.depots) {
      this.manageDailyBusListService.search(this.params).subscribe({
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
    this.dataSource = payload['daily_bus_list'].map(this.mapBusList.bind(this));
    this.selection = [];
    this.chkAll = false;
  }

  mapBusList(item: IBustList): IBustList {
    const depot = this.depots.find(_d => _d.depot_id === item.depot_id);
    return <IBustList>{
      ...item,
      depot_name: depot?.depot_name,
      last_update: item.updated_on,
      day: DayType.find(x => x.id === item.day_type)?.value,
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

  checkHandler(event: MatCheckboxChange, element: IBustList) {
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

  hiddenHandler(element: string) {
    return this.headerData.filter(x => x.field == element)[0].chk;
  }

  openView() {
    const dialogRef = this.dialog.open(ViewComponent, {
      width: '90%',
      height: '70%',
      disableClose: true,
      data: { title: 'Add Bus Entry' },
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
