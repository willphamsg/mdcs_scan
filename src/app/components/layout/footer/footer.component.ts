import {
  OnInit,
  AfterViewInit,
  Component,
  Inject,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DataListComponent } from '@app/components/data-list/data-list.component';
import { RouterModule } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { CommonService } from '@services/common.service';
import {
  DepoRequest,
  DropdownList,
  IOperatorList,
  PayloadResponse,
} from '@models/common';

@Component({
    selector: 'app-footer',
    imports: [
        DatePipe,
        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        MatMenuModule,
        RouterModule,
    ],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit, AfterViewInit {
  private commonService = inject(CommonService);

  dagw = environment.dagw;
  systems: { name: string; status: number }[] = [];
  pdtStatus: number;
  version: string = '';
  serviceProvider: string = '';
  depotAbbreviation: string = '';

  currentDate: Date;
  isBrowser = signal(false);
  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser.set(isPlatformBrowser(platformId));
  }

  ngOnInit(): void {
    this.commonService.getGeneralInformation(this.dagw).subscribe({
      next: (value: PayloadResponse) => {
        if (value.status == 200) {
          const source = value.payload['general_information'];
          this.systems = source.system_connection;
          this.pdtStatus = source.pdt_status;
          this.version = source.version;
          this.serviceProvider = source.service_provider;
          this.depotAbbreviation = source.depot_abbreviation;
        }
      },
      complete: () => {},
    });
  }

  ngAfterViewInit(): void {
    if (this.isBrowser()) {
      setInterval(() => {
        this.currentDate = new Date();
      }, 1000);
    }
  }

  connectedCount(): number {
    return this.systems.filter(system => system.status === 1).length || 0;
  }

  disconnectedCount(): number {
    return this.systems.filter(system => system.status === 0).length || 0;
  }
}
