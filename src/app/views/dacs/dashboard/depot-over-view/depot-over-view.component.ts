import {
  AsyncPipe,
  DatePipe,
  NgFor,
  NgIf,
  CommonModule,
} from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import {
  ChartConfiguration,
  ChartData,
  ChartEvent,
  ChartOptions,
} from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import DayType from '@data/day-type.json';
import { AuthService } from '@services/auth.service';
import { DepoService } from '@services/depo.service';
import { IDepoList } from '@models/depo';
import { dacsRoutes } from '@app/app.routes';
import { IBustExpList } from '@models/bus-exception-list';
import { IBustList } from '@models/bus-list';
import { ManageBusExceptionListService } from '@services/bus-exception-list.service';
import { ManageDailyBusListService } from '@services/manage-daily-bus-list.service';
import { PayloadResponse, BusRequest, IParams } from '@models/common';

@Component({
    selector: 'app-mdcs-depot-over-view',
    imports: [
        MatCardModule,
        MatIconModule,
        MatDividerModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule,
        MatSelectModule,
        MatTableModule,
        MatCheckboxModule,
        MatSortModule,
        MatButtonModule,
        CommonModule,
        RouterModule,
        NgFor,
        DatePipe,
        FormsModule,
        MatTabsModule,
        NgIf,
        NgFor,
        BaseChartDirective,
    ],
    templateUrl: './depot-over-view.component.html',
    styleUrls: ['./depot-over-view.component.scss']
})
export class DepotOverViewComponent implements OnInit, AfterViewInit {
  depots: IDepoList[] = [];
  depotSelected: IDepoList;

  events = [
    {
      desc: 'Bus Transfer from Depot A to Depot B',
      date: '2024-07-03T00:00:00',
    },
    {
      desc: 'SG Mobility Gallery',
      date: '2024-07-03T00:00:00',
    },
    {
      desc: 'Transport Congress',
      date: '2024-07-03T00:00:00',
    },
  ];

  taskList = [
    {
      desc: 'Add Bus Entry',
      date: '2024-07-03T00:00:00',
    },
    {
      desc: 'Approve New Parameters',
      date: '2024-07-03T00:00:00',
    },
    {
      desc: 'Reset password',
      date: '2024-07-03T00:00:00',
    },
  ];

  quickLinks = [
    {
      desc: 'Bus Daily Report',
      link: dacsRoutes?.report?.dailyReport,
    },
    {
      desc: 'Exception List',
      link: dacsRoutes?.bus?.busExpList,
    },
    {
      desc: 'Add New Bus Entry',
      link: dacsRoutes?.bus?.vehicleList,
    },
    {
      desc: 'Parameters View',
      link: dacsRoutes?.parameterManagement?.parameterViewer,
    },
    {
      desc: 'Add Hoc Report',
      link: dacsRoutes?.report?.adhoc,
    },
  ];

  //chart
  @ViewChild(BaseChartDirective) chart: BaseChartDirective<'bar'> | undefined;

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: true,
    elements: {
      bar: {
        backgroundColor: '#0072B2',
      },
    },
    scales: {
      x: {
        // min: 0,
        // max: 150,
        grid: {
          display: false,
        },
        ticks: {
          color: '#000',
        },
      },
      y: {
        // position: 'right',
        border: {
          display: true,
          dash: [100], // border dash pattern
        },
        grid: {
          display: false,
        },
        ticks: {
          color: '#000',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      // title: {
      //   display: true,
      //   text: 'No of Bus Connected to Depot',
      // },
    },
  };
  public barChartType = 'bar' as const;

  depotsForChart = [
    {
      name: 'Ang Mo Ko Depot',
      numOfBus: 100,
      status: 'success',
      arrived: 23,
      not_arrived: 5,
    },
    {
      name: 'Aver Raja Depot',
      numOfBus: 35,
      status: 'success',
      arrived: 18,
      not_arrived: 8,
    },
    {
      name: 'Bedok North Depot',
      numOfBus: 60,
      status: 'success',
      arrived: 10,
      not_arrived: 10,
    },
    {
      name: 'Braddel Depot',
      numOfBus: 50,
      status: 'success',
      arrived: 5,
      not_arrived: 15,
    },
    {
      name: 'Bukit Batok Depot',
      numOfBus: 30,
      status: 'error',
      arrived: 22,
      not_arrived: 1,
    },
    {
      name: 'Hougang Depot',
      numOfBus: 42,
      status: 'error',
      arrived: 13,
      not_arrived: 10,
    },
    {
      name: 'Loyang Depot',
      numOfBus: 90,
      status: 'success',
      arrived: 18,
      not_arrived: 8,
    },
    {
      name: 'Soon Lee Depot',
      numOfBus: 55,
      status: 'success',
      arrived: 13,
      not_arrived: 10,
    },
  ];

  public barChartData: ChartData<'bar'> = {
    labels: this.depotsForChart.map((depot: any) => depot.name),
    datasets: [
      {
        // barThickness: 36, //bar width
        label: 'No of Bus',
        data: this.depotsForChart.map((depot: any) => depot.numOfBus),
      },
    ],
  };

  //table data
  busExpDisplayedColumns: string[] = [
    'bus_num',
    'service_num',
    'exp_arrival_count',
    'act_arrival_time',
    'act_arrival_count',
  ];
  busExpDataSource: IBustExpList[] = [];

  busListDisplayedColumns: string[] = [
    'id',
    'bus_num',
    'service_num',
    'day_type',
    'est_arrival_time',
    'est_arrival_count',
  ];
  busListDataSource: IBustExpList[] = [];
  params: IParams = {
    page_size: 5,
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

  constructor(
    private authService: AuthService,
    private depoService: DepoService,
    private manageBusExceptionListService: ManageBusExceptionListService,
    private manageDailyBusListService: ManageDailyBusListService,
    private activeRouter: ActivatedRoute,
    private router: Router
  ) {
    this.depoService?.depoList$?.subscribe((value: IDepoList[]) => {
      this.depots = value;
      const depotId = this.activeRouter.snapshot.paramMap.get('id');
      const depotSelected = value.find(
        (_v: IDepoList) => _v.depot_id == depotId
      );
      if (depotSelected) {
        this.depotSelected = depotSelected;
      }
    });
  }

  ngOnInit() {
    this.reloadHandler();
  }

  reloadHandler() {
    this.manageBusExceptionListService.search(this.params).subscribe({
      next: (value: PayloadResponse) => {
        if (value.status == 200) {
          const source = value.payload['bus_exception_list'];
          this.busExpDataSource = source.map((item: IBustExpList) => {
            return <IBustExpList>item;
          });
        }
      },
    });

    this.manageDailyBusListService.search(this.params).subscribe({
      next: (value: PayloadResponse) => {
        if (value.status == 200) {
          const source = value.payload['daily_bus_list'];
          this.busListDataSource = source.map((item: IBustList) => {
            return <IBustList>{
              chk: false,
              id: item.id,
              version: item.version,
              depot_id: item.depot_id,
              depot_name: item.depot_id,
              bus_num: item.bus_num,
              service_num: item.service_num,
              svc_prov_id: item.svc_prov_id,
              day_type: DayType.find(X => X.id == item.day_type)?.value,
              // day: this.options.filter(X => X.id == item.day_type)[0].value,
              est_arrival_time: item.est_arrival_time,
              est_arrival_count: item.est_arrival_count,
              updated_on: item.updated_on,
            };
          });
        }
      },
    });
  }

  handleSelectDepot(event: any) {
    if (event.value) {
      const depotSelected = this.depots.find(
        (_v: IDepoList) => _v.depot_id == event.value
      );
      if (depotSelected) {
        this.depotSelected = depotSelected;
      }
    } else {
      this.router.navigate(['/dacs/dashboard']);
    }
  }

  // events
  public chartClicked({
    event,
    active,
  }: {
    event?: ChartEvent;
    active?: object[];
  }): void {
    console.log(event, active);
  }

  public chartHovered({
    event,
    active,
  }: {
    event?: ChartEvent;
    active?: object[];
  }): void {
    console.log(event, active);
  }

  public randomize(): void {
    // Only Change 3 values
    this.barChartData.datasets[0].data = [
      Math.round(Math.random() * 100),
      59,
      80,
      Math.round(Math.random() * 100),
      56,
      Math.round(Math.random() * 100),
      40,
      Math.round(Math.random() * 100),
    ];

    this.chart?.update();
  }

  // display arrived percentage
  private renderArrivedPercentage(): void {
    Array.from(
      document.getElementsByClassName(
        'percent'
      ) as HTMLCollectionOf<HTMLElement>
    ).forEach(element => {
      const perc = Number(element?.innerText || 0);
      const progressElement = element?.closest('.progress') as HTMLElement;
      const barElement = progressElement?.querySelector('.bar') as HTMLElement;

      // 100%=180° so: ° = % * 1.8
      // 45 is to add the needed rotation to have the green borders at the bottom
      barElement.style.transform = `rotate(${45 + perc * 1.8}deg)`;
    });
  }

  ngAfterViewInit() {
    this.renderArrivedPercentage();
  }
}
