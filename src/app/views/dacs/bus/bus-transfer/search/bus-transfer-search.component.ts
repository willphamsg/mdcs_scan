import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { FilterComponent } from '@app/components/filter/filter.component';
import { MonthFilterComponent } from '@app/components/filter/month-filter/month-filter.component';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { CommonService } from '@app/services/common.service';
import { FilterService } from '@app/services/filter.service';
import { MessageService } from '@app/services/message.service';
import { PaginationService } from '@app/services/pagination.service';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import { AppStore } from '@app/store/app.state';
import { showSnackbar } from '@app/store/snackbar/snackbar.actions';
import { BreadcrumbsComponent } from '@components/layout/breadcrumbs/breadcrumbs.component';
import BusTransferHeader from '@data/bus-transfer-header.json';
import { IBusTransferList } from '@models/bus-transfer';
import {
  DropdownList,
  IHeader,
  IOperatorList,
  IPaginationEvent,
  IParams,
  PayloadResponse,
} from '@models/common';
import { IDepoList } from '@models/depo';
import { Store } from '@ngrx/store';
import { ManageBusTransferService } from '@services/bus-transfer.service';
import { DepoService } from '@services/depo.service';
import { combineLatest, Observable, of, Subject, takeUntil } from 'rxjs';
import { BusTransferViewComponent } from '../view/view.component';

@Component({
    selector: 'app-bus-transfer-search',
    templateUrl: './bus-transfer-search.component.html',
    styleUrls: ['./bus-transfer-search.component.scss'],
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
        MonthFilterComponent,
    ]
})
export class BusTransferSearchComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  paginatedData$: Observable<IBusTransferList[]> = of([]);

  headerData = BusTransferHeader;
  chkAll: boolean = false;
  displayedColumns: string[] = BusTransferHeader.map((x: IHeader) => {
    return x.field;
  });
  dataSource: IBusTransferList[] = [];
  selection: IBusTransferList[] = [];

  rowCount: number = 0;
  currentPage: number = 1;

  params: IParams = {
    page_size: 10,
    page_index: 0,
    sort_order: [],
    search_text: '',
    search_select_filter: {
      status: [],
      current_depot: [],
      current_operator: [],
      future_operator: [],
    },
  };

  tabIdx = 0;
  depots: IDepoList[] = [];
  operators: DropdownList[] = [];
  statuses: DropdownList[] = [];
  initialLoad: boolean = true;
  pageSize: number;

  filterConfigs: IFilterConfig[] = [];

  constructor(
    private manageBusTransferService: ManageBusTransferService,
    private depoService: DepoService,
    private commonService: CommonService,
    private messageService: MessageService,
    public dialog: MatDialog,
    private store: Store<AppStore>,
    private paginationService: PaginationService,
    private filterService: FilterService
  ) {}

  ngOnInit() {
    this.subscribeToDepoChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  subscribeToDepoChanges(): void {
    const depotList$ = this.depoService.depoList$;
    const searchValue$ = this.filterService.searchValue$;
    const filterValues$ = this.filterService.filterValues$;

    this.commonService
      .search({
        patternSearch: false,
        search_text: '',
        is_pattern_search: false,
        page_size: 100,
        page_index: 0,
        sort_order: [],
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: PayloadResponse) => {
        const resp = this.messageService.MessageResponse(value, true);
        if (resp) {
          const source = value.payload['svc_prov_list'];
          const formatData = source.map((item: any) => {
            return <IOperatorList>{
              id: item.id,
              svc_prov_id: item.svc_prov_id,
              svc_prov_code: item.svc_prov_code,
              svc_prov_name: item.svc_prov_name,
            };
          });

          this.operators = formatData.map((item: IOperatorList) => {
            return <DropdownList>{
              id: item.svc_prov_id,
              value: item.svc_prov_name,
            };
          });

          combineLatest([depotList$, searchValue$, filterValues$])
            .pipe(takeUntil(this.destroy$))
            .subscribe(([depotList, searchValue, filterValue]) => {
              this.params.search_text = searchValue;
              this.depots = depotList;

              const {
                currDepot = [],
                currOperator = [],
                futureOperator = [],
              } = filterValue || {};

              this.params.search_select_filter = {
                ...this.params.search_select_filter,
                current_depot: currDepot,
                current_operator: currOperator,
                future_operator: futureOperator,
              };

              this.loadFilterValues();
              this.reloadHandler();
            });
        }
      });
  }

  loadFilterValues(): void {
    this.filterConfigs = [
      {
        controlName: 'currDepot',
        value: [],
        type: 'array',
        options: this.depots,
      },
      {
        controlName: 'currOperator',
        value: [],
        type: 'array',
        options: this.operators,
      },
      {
        controlName: 'futureOperator',
        value: [],
        type: 'array',
        options: this.operators,
      },
    ];
  }

  reloadHandler(): void {
    if (this.operators.length > 0) {
      this.manageBusTransferService
        .search(this.params)
        .pipe(takeUntil(this.destroy$))
        .subscribe((value: PayloadResponse) => {
          if (value.status == 200) {
            this.updateDataSource(value.payload);
          }
        });
    }
  }

  updateDataSource(payload: any): void {
    this.rowCount = payload['records_count'];
    this.dataSource = payload['bus_transfer_list'].map(
      this.mapBusList.bind(this)
    );
    this.selection = [];
    this.chkAll = false;
  }

  mapBusList(item: IBusTransferList): IBusTransferList {
    return {
      ...item,
      chk: false,
      current_depot_name:
        this.depots.find(x => x.depot_id == item.current_depot)?.depot_name ||
        '',
      current_operator_name:
        this.operators.find(x => x.id == item.current_operator)?.value || '',
      future_depot_name:
        this.depots.find(x => x.depot_id == item.future_depot)?.depot_name ||
        '',
      future_operator_name:
        this.operators.find(x => x.id == item.future_operator)?.value || '',
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

  checkHandler(event: MatCheckboxChange, element: IBusTransferList) {
    if (event.checked) {
      this.selection.push(element);
    } else {
      this.selection = this.selection.filter(x => x.id != element.id);
    }
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

  updateView(action: string) {
    const dialogRef = this.dialog.open(BusTransferViewComponent, {
      width: '95%',
      height: '70%',
      disableClose: true,
      data: {
        title: `${action === 'update' ? 'Edit' : action === 'reject' ? 'Reject' : 'Approve'} Bus Transfer`,
        selection: this.selection,
        action,
      },
    });

    dialogRef.afterClosed().subscribe(bhv => {
      if (bhv === 'cancel') {
        return;
      }
      this.tabIdx = 0;
      this.reloadHandler();
    });
  }

  importHandler(event: any) {
    if (event.target.files.length) {
      const fileList = event.target.files;
      const formData = new FormData();
      for (let index = 0; index < fileList.length; index++) {
        formData.append('file', fileList[index]);
      }
      this.manageBusTransferService.import(formData).subscribe({
        next: (value: PayloadResponse) => {
          if (value.status == 201) {
            this.store.dispatch(
              showSnackbar({
                message: value.message,
                title: 'Success',
                typeSnackbar: 'success',
              })
            );

            this.reloadHandler();
          }
        },
      });
    }
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
}
