import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';

import { DepoService } from '@services/depo.service';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IDepoList } from '@models/depo';
import { FilterComponent } from '@app/components/filter/filter.component';
import { SelectedFilterComponent } from '@app/components/filter/selected-filter/selected-filter.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { IHeader } from '@app/models/common';
import { IMessage } from '@app/models/message';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import { BreadcrumbsComponent } from '../../breadcrumbs/breadcrumbs.component';

@Component({
    selector: 'app-event-history',
    imports: [
        BreadcrumbsComponent,
        MatTableModule,
        MatCardModule,
        MatToolbarModule,
        MatTabsModule,
        MatMenuModule,
        MatDividerModule,
        CommonModule,
        PaginationComponent,
        FilterComponent,
        SelectedFilterComponent,
    ],
    templateUrl: './event-history.component.html',
    styleUrl: './event-history.component.scss'
})
export class EventHistoryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  eventHistory: IMessage[] = [];
  headerData = [
    {
      chk: true,
      field: 'id',
      name: 'No',
      hidden: false,
    },
    {
      chk: true,
      field: 'depot',
      name: 'Depots',
      hidden: false,
    },
    {
      chk: true,
      field: 'eventDateTime',
      name: 'Event Date Time',
      hidden: false,
    },
    {
      chk: true,
      field: 'description',
      name: 'Description',
      hidden: false,
    },
  ];
  tab1Columns: string[] = this.headerData.map((x: IHeader) => x.field);
  filterConfigs: IFilterConfig[] = [];

  depots: IDepoList[] = [];

  dataSource: any[] = [
    {
      depot: {
        depot_id: '3',
        depot_name: 'Aver Raja Depot Depot',
      },
      eventDateTime: '19/09/2024 12:11:23',
      event: 'Parameter Server Error',
      description:
        '[PDMS][DP:0000]Download[/apps/pdms/messages/016/0968/DCS_BLWA.DEC][F].Error: [78] - Get file failed: Remote file not found, 78, Retry: 1',
    },
    {
      depot: {
        depot_id: '1',
        depot_name: 'Hougang Depot',
      },
      eventDateTime: '19/09/2024 11:02:34',
      event: 'Parameter Server Error',
      description:
        '[PDMS][DP:0000]Download[/apps/pdms/messages/016/0968/DCS_BLWA.DEC][F].Error: [78] - Get file failed: Remote file not found, 78, Retry: 1',
    },
    {
      depot: {
        depot_id: '2',
        depot_name: 'Ang Mo Kio Depot',
      },
      eventDateTime: '19/09/2024 10:11:23',
      event: 'Parameter Server Error',
      description:
        '[PDMS][DP:0000]Download[/apps/pdms/messages/016/0968/DCS_BLWA.DEC][F].Error: [78] - Get file failed: Remote file not found, 78, Retry: 1',
    },
    {
      depot: {
        depot_id: '2',
        depot_name: 'Ang Mo Kio Depot',
      },
      eventDateTime: '17/09/2024 12:11:23',
      event: 'System Connection',
      description: 'DAGW from East Coast Integrated Bus Depot connected',
    },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private depoService: DepoService
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
    this.depoService.depoList$
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: IDepoList[]) => {
        this.depots = value;
      });
  }

  loadFilterValues(): void {
    this.filterConfigs = [
      {
        controlName: 'depotsSec',
        value: [],
        type: 'array',
        options: this.depots,
      },
      {
        controlName: 'eventDateTime',
        type: 'date-range',
        children: [
          { controlName: 'startDate', value: '' },
          { controlName: 'endDate', value: '' },
        ],
      },
    ];
  }
}
