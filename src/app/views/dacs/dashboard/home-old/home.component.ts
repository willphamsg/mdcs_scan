import {
  AsyncPipe,
  CommonModule,
  DatePipe,
  NgFor,
  NgIf,
} from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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
import { Router, RouterModule } from '@angular/router';

import { ChartConfiguration, ChartData, ChartEvent } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { dacsRoutes } from '@app/app.routes';
import { IDepoList } from '@models/depo';
import { AuthService } from '@services/auth.service';
import { DepoService } from '@services/depo.service';

@Component({
    selector: 'app-mdcs-home',
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
        DatePipe,
        FormsModule,
        MatTabsModule,
        BaseChartDirective,
    ],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  depots: IDepoList[] = [];
  depotSelected: string = '';

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
      desc: 'Ad-Hoc Report',
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

  constructor(
    private depoService: DepoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.depoService?.depoList$?.subscribe((value: IDepoList[]) => {
      this.depots = value;
    });
  }

  handleSelectDepot(event: any) {
    if (event.value) {
      this.router.navigate(['/dacs/dashboard', event.value]);
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
  // example: https://codepen.io/jagathish/pen/ZXzbzN?editors=1111
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
