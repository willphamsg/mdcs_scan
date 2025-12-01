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

import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { dacsRoutes } from '@app/app.routes';
import { IDepoList } from '@models/depo';
import { AuthService } from '@services/auth.service';
import { DepoService } from '@services/depo.service';

import {
  LineChartComponent,
  LineChartConfig,
} from '@components/line-chart/line-chart.component';

interface IBusDetails {
  time: string;
  num_of_buses: number;
}
interface IConnectedBus {
  depot_name: string;
  depot_code: string;
  depot_id?: string;
  total: number;
  bus_details: IBusDetails[];
}

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
        FormsModule,
        MatTabsModule,
        LineChartComponent,
    ],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  depots: IDepoList[] = [];
  depotSelected: string = '';
  hourSelected: number = 1;

  depotStatues = [
    {
      depot_name: 'Ang Mo Kio Depot',
      depot_code: 'AMKD',
      status: 'down',
      id: 1,
    },
    {
      depot_name: 'Bedok North Depot',
      depot_code: 'BND',
      status: 'up',
      id: 2,
    },
    {
      depot_name: 'Bukit Batok Depot',
      depot_code: 'BBD',
      status: 'up',
      id: 3,
    },
    {
      depot_name: 'Loyang Depot',
      depot_code: 'LD',
      status: 'down',
      id: 4,
    },
    {
      depot_name: 'Ayer Rajah Depot',
      depot_code: 'ARD',
      status: 'up',
      id: 5,
    },
    {
      depot_name: 'Braddel Depot',
      depot_code: 'BD',
      status: 'degraded',
      id: 6,
    },
    {
      depot_name: 'Hougang Depot',
      depot_code: 'HD',
      status: 'degraded',
      id: 7,
    },
  ];

  taskList = [
    {
      desc: 'Bus Transfer',
      order: 8,
    },
    {
      desc: 'New Parameter Approval',
      order: 22,
    },
    {
      desc: 'Parameter Mode',
      order: 3,
    },
    {
      desc: 'End Trial',
      order: 2,
    },
  ];

  connectedBuses: IConnectedBus[] = [
    {
      depot_name: 'Ang Mo Kio Depot',
      depot_code: 'AMKD',
      depot_id: '2',
      total: 100,
      bus_details: [
        { time: '09:00:00', num_of_buses: 10 },
        { time: '09:10:00', num_of_buses: 15 },
        { time: '09:20:00', num_of_buses: 5 },
        { time: '09:30:00', num_of_buses: 25 },
        { time: '09:40:00', num_of_buses: 30 },
        { time: '09:50:00', num_of_buses: 35 },
        { time: '10:00:00', num_of_buses: 40 },
        { time: '10:10:00', num_of_buses: 45 },
        { time: '10:20:00', num_of_buses: 2 },
        { time: '10:30:00', num_of_buses: 55 },
        { time: '10:40:00', num_of_buses: 60 },
        { time: '10:50:00', num_of_buses: 65 },
        { time: '11:00:00', num_of_buses: 4 },
        { time: '11:10:00', num_of_buses: 75 },
        { time: '11:20:00', num_of_buses: 80 },
        { time: '11:30:00', num_of_buses: 7 },
        { time: '11:40:00', num_of_buses: 90 },
        { time: '11:50:00', num_of_buses: 95 },
        { time: '12:00:00', num_of_buses: 100 },
      ],
    },
    {
      depot_name: 'Bedok North Depot',
      depot_code: 'BND',
      total: 120,
      depot_id: '4',
      bus_details: [
        { time: '09:00:00', num_of_buses: 5 },
        { time: '09:10:00', num_of_buses: 10 },
        { time: '09:20:00', num_of_buses: 15 },
        { time: '09:30:00', num_of_buses: 20 },
        { time: '09:40:00', num_of_buses: 25 },
        { time: '09:50:00', num_of_buses: 30 },
        { time: '10:00:00', num_of_buses: 35 },
        { time: '10:10:00', num_of_buses: 40 },
        { time: '10:20:00', num_of_buses: 45 },
        { time: '10:30:00', num_of_buses: 50 },
        { time: '10:40:00', num_of_buses: 55 },
        { time: '10:50:00', num_of_buses: 60 },
        { time: '11:00:00', num_of_buses: 65 },
        { time: '11:10:00', num_of_buses: 70 },
        { time: '11:20:00', num_of_buses: 75 },
        { time: '11:30:00', num_of_buses: 80 },
        { time: '11:40:00', num_of_buses: 85 },
        { time: '11:50:00', num_of_buses: 90 },
        { time: '12:00:00', num_of_buses: 95 },
      ],
    },
    {
      depot_name: 'Bukit Batok Depot',
      depot_code: 'BBD',
      total: 80,
      depot_id: '5',
      bus_details: [
        { time: '09:00:00', num_of_buses: 8 },
        { time: '09:10:00', num_of_buses: 12 },
        { time: '09:20:00', num_of_buses: 16 },
        { time: '09:30:00', num_of_buses: 20 },
        { time: '09:40:00', num_of_buses: 24 },
        { time: '09:50:00', num_of_buses: 28 },
        { time: '10:00:00', num_of_buses: 32 },
        { time: '10:10:00', num_of_buses: 36 },
        { time: '10:20:00', num_of_buses: 40 },
        { time: '10:30:00', num_of_buses: 44 },
        { time: '10:40:00', num_of_buses: 48 },
        { time: '10:50:00', num_of_buses: 52 },
        { time: '11:00:00', num_of_buses: 56 },
        { time: '11:10:00', num_of_buses: 60 },
        { time: '11:20:00', num_of_buses: 64 },
        { time: '11:30:00', num_of_buses: 68 },
        { time: '11:40:00', num_of_buses: 72 },
        { time: '11:50:00', num_of_buses: 76 },
        { time: '12:00:00', num_of_buses: 80 },
      ],
    },
    {
      depot_name: 'Loyang Depot',
      depot_code: 'LD',
      total: 90,
      depot_id: '6',
      bus_details: [
        { time: '09:00:00', num_of_buses: 20 },
        { time: '09:10:00', num_of_buses: 25 },
        { time: '09:20:00', num_of_buses: 30 },
        { time: '09:30:00', num_of_buses: 35 },
        { time: '09:40:00', num_of_buses: 40 },
        { time: '09:50:00', num_of_buses: 45 },
        { time: '10:00:00', num_of_buses: 50 },
        { time: '10:10:00', num_of_buses: 55 },
        { time: '10:20:00', num_of_buses: 60 },
        { time: '10:30:00', num_of_buses: 65 },
        { time: '10:40:00', num_of_buses: 70 },
        { time: '10:50:00', num_of_buses: 75 },
        { time: '11:00:00', num_of_buses: 80 },
        { time: '11:10:00', num_of_buses: 85 },
        { time: '11:20:00', num_of_buses: 90 },
        { time: '11:30:00', num_of_buses: 95 },
        { time: '11:40:00', num_of_buses: 100 },
        { time: '11:50:00', num_of_buses: 105 },
        { time: '12:00:00', num_of_buses: 110 },
      ],
    },
    {
      depot_name: 'Ayer Rajah Depot',
      depot_code: 'ARD',
      depot_id: '3',
      total: 110,
      bus_details: [
        { time: '09:00:00', num_of_buses: 15 },
        { time: '09:10:00', num_of_buses: 20 },
        { time: '09:20:00', num_of_buses: 25 },
        { time: '09:30:00', num_of_buses: 10 },
        { time: '09:40:00', num_of_buses: 35 },
        { time: '09:50:00', num_of_buses: 15 },
        { time: '10:00:00', num_of_buses: 45 },
        { time: '10:10:00', num_of_buses: 50 },
        { time: '10:20:00', num_of_buses: 55 },
        { time: '10:30:00', num_of_buses: 20 },
        { time: '10:40:00', num_of_buses: 65 },
        { time: '10:50:00', num_of_buses: 25 },
        { time: '11:00:00', num_of_buses: 25 },
        { time: '11:10:00', num_of_buses: 80 },
        { time: '11:20:00', num_of_buses: 85 },
        { time: '11:30:00', num_of_buses: 90 },
        { time: '11:40:00', num_of_buses: 30 },
        { time: '11:50:00', num_of_buses: 100 },
        { time: '12:00:00', num_of_buses: 105 },
      ],
    },
    {
      depot_name: 'Braddel Depot',
      depot_code: 'BD',
      total: 70,
      depot_id: '6',
      bus_details: [
        { time: '09:00:00', num_of_buses: 12 },
        { time: '09:10:00', num_of_buses: 18 },
        { time: '09:20:00', num_of_buses: 24 },
        { time: '09:30:00', num_of_buses: 30 },
        { time: '09:40:00', num_of_buses: 36 },
        { time: '09:50:00', num_of_buses: 42 },
        { time: '10:00:00', num_of_buses: 48 },
        { time: '10:10:00', num_of_buses: 54 },
        { time: '10:20:00', num_of_buses: 60 },
        { time: '10:30:00', num_of_buses: 66 },
        { time: '10:40:00', num_of_buses: 72 },
        { time: '10:50:00', num_of_buses: 78 },
        { time: '11:00:00', num_of_buses: 84 },
        { time: '11:10:00', num_of_buses: 90 },
        { time: '11:20:00', num_of_buses: 96 },
        { time: '11:30:00', num_of_buses: 102 },
        { time: '11:40:00', num_of_buses: 108 },
        { time: '11:50:00', num_of_buses: 114 },
        { time: '12:00:00', num_of_buses: 120 },
      ],
    },
    {
      depot_name: 'Hougang Depot', // Note the typo in the original code
      depot_code: 'HD', // Note the typo in the original code
      total: 60,
      depot_id: '1',
      bus_details: [
        { time: '09:00:00', num_of_buses: 18 },
        { time: '09:10:00', num_of_buses: 24 },
        { time: '09:20:00', num_of_buses: 30 },
        { time: '09:30:00', num_of_buses: 36 },
        { time: '09:40:00', num_of_buses: 42 },
        { time: '09:50:00', num_of_buses: 22 },
        { time: '10:00:00', num_of_buses: 54 },
        { time: '10:10:00', num_of_buses: 60 },
        { time: '10:20:00', num_of_buses: 66 },
        { time: '10:30:00', num_of_buses: 32 },
        { time: '10:40:00', num_of_buses: 78 },
        { time: '10:50:00', num_of_buses: 84 },
        { time: '11:00:00', num_of_buses: 42 },
        { time: '11:10:00', num_of_buses: 96 },
        { time: '11:20:00', num_of_buses: 18 },
        { time: '11:30:00', num_of_buses: 52 },
        { time: '11:40:00', num_of_buses: 28 },
        { time: '11:50:00', num_of_buses: 46 },
        { time: '12:00:00', num_of_buses: 62 },
      ],
    },
  ];

  busesRendered: IConnectedBus[] = [];

  public lineChartType: ChartType = 'line';

  public lineChartData: ChartConfiguration['data'] = {
    labels: this.connectedBuses[0].bus_details.map((bus: any) => bus.time),
    datasets: [
      {
        // barThickness: 36, //bar width
        data: this.connectedBuses[0].bus_details.map(
          (bus: any) => bus.num_of_buses
        ),
        label: '',
        // backgroundColor: 'rgba(0,0,0)',
        borderColor: '#648fff',
        borderWidth: 1,
        pointBackgroundColor: 'rgba(148,159,177,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,0.8)',
        // fill: 'origin',
      },
    ],
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    backgroundColor: '#F3F7FF',
    elements: {
      line: {
        tension: 0.5,
      },
    },
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      x: {
        ticks: {
          maxRotation: 90,
          minRotation: 90,
        },
        grid: {
          display: false,
        },
      },
      y: {
        position: 'left',
        border: {
          display: true,
        },
      },
    },

    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Depot ABC',
        align: 'start',
        color: '#000',
        font: {
          size: 16,
        },
        padding: {
          top: 10,
          bottom: 0,
        },
      },
      subtitle: {
        display: true,
        text: 'Total Bus: 20',
        align: 'end',
        color: '#000',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          top: -15,
          bottom: 30,
        },
      },
    },
  };

  constructor(
    private depoService: DepoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.depoService?.depoList$?.subscribe((value: IDepoList[]) => {
      this.depots = value;
    });

    this.generateBusesRendered();
  }

  private generateBusesRendered() {
    let tempBuses = this.connectedBuses;
    if (this.depotSelected) {
      tempBuses = this.connectedBuses.filter(
        bus => bus.depot_id === this.depotSelected
      );
    }
    this.busesRendered = tempBuses.map(bus => {
      return {
        ...bus,
        bus_details: bus.bus_details.slice(0, this.hourSelected * 7),
      };
    });
    // console.log('Connected Buses Rendered:', this.busesRendered);
  }

  setHour(hour: number) {
    this.hourSelected = hour;
    this.generateBusesRendered();
    // console.log('Hour selected:', this.busesRendered);
  }

  transformChartData(connectedBus: IConnectedBus) {
    return connectedBus.bus_details.map((bus: IBusDetails) => ({
      x: bus.time,
      y: bus.num_of_buses,
    }));
  }

  chartConfig(connectedBus: IConnectedBus): LineChartConfig {
    return {
      title: connectedBus.depot_name,
      subtitle: `Bus in Depot: ${connectedBus.total}`,
      borderWidth: 1,
      borderColor: '#648fff',
      showXGrid: false,
      showYGrid: true,
      verticalLabels: true,
      backgroundColor: '#F3F7FF',
    };
  }

  handleSelectDepot(event: any) {
    // if (event.value) {
    //   this.router.navigate(['/dacs/dashboard', event.value]);
    // }

    this.depotSelected = event.value;
    this.generateBusesRendered();
  }
}
