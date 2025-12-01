import {
  Component,
  inject,
  OnInit,
  AfterViewInit,
  HostListener,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NgFor, NgIf, CommonModule, DOCUMENT } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';

import { MatSidenav } from '@angular/material/sidenav';
import { Router, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { dacsRoutes, dawgRoutes } from '@app/app.routes';
import { DepoService } from '@services/depo.service';
import {
  DepoRequest,
  DropdownList,
  IOperatorList,
  PayloadResponse,
} from '@models/common';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { IDepoList } from '@models/depo';
import { environment } from '../../../../environments/environment';
import { AuthService } from '@app/services/auth.service';
import { UserProfile } from '@app/models/user';
import { MatBadgeModule } from '@angular/material/badge';
import { NotificationComponent } from '@app/components/notification/notification.component';
import { CommonService } from '@app/services/common.service';
import { MessageService } from '@app/services/message.service';
import { OverlayModule } from '@angular/cdk/overlay';

@Component({
    selector: 'app-header',
    imports: [
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatExpansionModule,
        RouterModule,
        MatSelectModule,
        FormsModule,
        MatListModule,
        CommonModule,
        MatBadgeModule,
        NotificationComponent,
        OverlayModule,
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private depoService = inject(DepoService);
  private commonService = inject(CommonService);
  private messageService = inject(MessageService);

  private router = inject(Router);
  private document = inject(DOCUMENT);
  params: DepoRequest = {
    patternSearch: false,
    search_text: '',
    is_pattern_search: false,
    page_size: 100,
    page_index: 0,
    sort_order: [],
  };
  options: IDepoList[] = [];
  depotId: any;
  dagw = environment.dagw;
  routesUrl: any = environment.dagw ? dawgRoutes : dacsRoutes;
  expandedMenu: { [key: string]: boolean } = {};
  activeMenu: string = 'dashboard';

  isOpenMobileMenu: boolean = false;

  userProfile: { name?: string; role?: string; avatarUrl?: string } = {};

  @ViewChild('mobileNav', { static: false }) mobileNav!: ElementRef;

  navList: any = [
    {
      label: 'Monitoring',
      value: 'monitoring',
      subs: [
        {
          label: 'Bus Operation Status',
          value: 'bus-operation-status',
          href: this.routesUrl?.monitoring?.busOperation,
        },
        {
          label: 'Card Key Versions',
          value: 'card-key-versions',
          href: this.routesUrl?.monitoring?.cardKeyVersion,
        },
      ],
    },
    {
      label: 'Bus Management',
      value: 'bus',
      subs: [
        {
          label: 'Daily Bus List',
          value: 'daily-bus-list',
          href: this.routesUrl?.bus?.busList,
        },
        {
          label: 'Vehicle Map',
          value: 'vehicle-map',
          href: this.routesUrl?.bus?.vehicleList,
        },
        {
          label: 'Bus Transfer',
          value: 'bus-transfer',
          href: this.routesUrl?.bus?.busTransfer,
        },
      ],
    },
    {
      label: 'Parameter Management',
      value: 'paramManagement',
      subs: [
        {
          label: 'DAGW Parameter Summary',
          value: 'dagw-parameter-summary',
          href: this.routesUrl?.parameterManagement?.dagwParameter,
        },
        {
          label: 'Parameter Viewer',
          value: 'parameter-viewer',
          href: this.routesUrl?.parameterManagement?.parameterViewer,
        },
        {
          label: 'Parameter File Import',
          value: 'parameter-file-import',
          href: this.routesUrl?.parameterManagement?.importParameter,
        },
        {
          label: 'Parameter File Export',
          value: 'parameter-file-export',
          href: this.routesUrl?.parameterManagement?.exportParameter,
        },
        {
          label: 'Device Application Management System(DAMS)',
          value: 'dams',
          target: '_blank',
          href: 'https://www.google.com',
        },
      ],
    },
    {
      label: 'Parameter Trial',
      value: 'paramTrial',
      subs: [
        {
          label: 'Trial Device Selection',
          value: 'trial-device-selection',
          href: this.routesUrl?.parameterTrial?.trialDeviceSelection,
        },
        {
          label: 'New Parameter Approval',
          value: 'new-parameter-approval',
          href: this.routesUrl?.parameterTrial?.approval,
        },
        {
          label: 'Parameter Mode',
          value: 'parameter-mode',
          href: this.routesUrl?.parameterTrial?.parameterMode,
        },
        {
          label: 'End Trial',
          value: 'end-trial',
          href: this.routesUrl?.parameterTrial?.endTrial,
        },
        {
          label: 'Parameter Version Summary',
          value: 'parameter-version-summary',
          href: this.routesUrl?.parameterTrial?.parameterVersionSummary,
        },
      ],
    },
    {
      label: 'Report',
      value: 'report',
      subs: [
        {
          label: 'Ad-Hoc Report',
          value: 'ad-hoc-report',
          subs: [
            {
              label: 'All Daily Report',
              value: 'all-daily-report',
              href: this.routesUrl?.report?.dailyReport?.allDailyReport,
            },
            {
              label: 'Bus Arrival Exception List',
              value: 'bus-arrival-exception-list',
              href: this.routesUrl?.report?.dailyReport?.busArrival,
            },
            {
              label: 'Bus List Audit Trial',
              value: 'bus-list-audit-trial',
              href: this.routesUrl?.report?.dailyReport?.busAuditTrial,
            },
            {
              label: 'Bus Partial Upload Report',
              value: 'bus-partial-upload-report',
              href: this.routesUrl?.report?.dailyReport?.busPartialUploadReport,
            },
            {
              label: 'Bus Transfer Report',
              value: 'bus-transfer-report',
              href: this.routesUrl?.report?.dailyReport?.busTransferReport,
            },
            {
              label: 'Daily Bus List Report',
              value: 'daily-bus-list-report',
              href: this.routesUrl?.report?.dailyReport?.dailyBusListReport,
            },
            {
              label: 'DAGW Monthly Availability Report',
              value: 'dagw-monthly-availability-report',
              href: this.routesUrl?.report?.dailyReport?.dagwMonthlyReport,
            },
          ],
        },
        {
          label: 'Daily Report',
          value: 'daily-report',
          subs: [
            {
              label: 'Bus Arrival Exception List',
              value: 'bus-arrival-exception-list',
              href: this.routesUrl?.report?.adhoc?.busArrival,
            },
            {
              label: 'Bus List Audit Trial',
              value: 'bus-list-audit-trial',
              href: this.routesUrl?.report?.adhoc?.busAuditTrial,
            },
            {
              label: 'Bus Partial Upload Report',
              value: 'bus-partial-upload-report',
              href: this.routesUrl?.report?.adhoc?.busPartialUploadReport,
            },
            {
              label: 'Bus Transfer Report',
              value: 'bus-transfer-report',
              href: this.routesUrl?.report?.adhoc?.busTransferReport,
            },
            {
              label: 'Daily Bus List Report',
              value: 'daily-bus-list-report',
              href: this.routesUrl?.report?.adhoc?.dailyBusListReport,
            },
            {
              label: 'DAGW Monthly Availability Report',
              value: 'dagw-monthly-availability-report',
              href: this.routesUrl?.report?.adhoc?.dagwMonthlyReport,
            },
          ],
        },
      ],
    },
    {
      label: 'Maintenance',
      value: 'maintenance',
      subs: [
        {
          label: 'Diagnostics',
          value: 'diagnostics',
          href: this.routesUrl?.maintenance?.diagnostics,
        },
        {
          label: 'EOD Process',
          value: 'eod-process',
          href: this.routesUrl?.maintenance?.eodProcess,
        },
        {
          label: 'Audit Log',
          value: 'audit-log',
          href: this.routesUrl?.maintenance?.auditLog,
        },
        {
          label: 'System Info',
          value: 'system-info',
          href: this.routesUrl?.maintenance?.systemInformation,
        },
      ],
    },
  ];

  dagwNavList: any = [
    {
      label: 'Monitoring & Bus Management',
      value: 'monitoring',
      subs: [
        {
          label: 'Bus Operation Status',
          value: 'bus-operation-status',
          href: dawgRoutes.busMonitoring.busOperation,
        },
        {
          label: 'Vehicle Map',
          value: 'vehicle-map',
          href: dawgRoutes.busMonitoring.vehicleList,
        },
      ],
    },
    {
      label: 'Parameter Trial & Management',
      value: 'paramManagement',
      subs: [
        {
          label: 'DAGW Parameter Summary',
          value: 'dagw-parameter-summary',
          href: dawgRoutes?.parameterTrialManagement?.dagwParameter,
        },
        {
          label: 'Parameter File Import',
          value: 'parameter-file-import',
          href: dawgRoutes?.parameterTrialManagement?.importParameter,
        },
        {
          label: 'Parameter File Export',
          value: 'parameter-file-export',
          href: dawgRoutes?.parameterTrialManagement?.exportParameter,
        },
        {
          label: 'Trial Device List',
          value: 'trial-device-list',
          href: dacsRoutes?.parameterTrial?.trialDeviceSelection,
        },
      ],
    },
    {
      label: 'Message Data Management',
      value: 'messageDataManagement',
      subs: [
        {
          label: 'Message File Import',
          value: 'message-file-import',
          href: dawgRoutes?.messageDataManagement?.messageFileImport,
        },
        {
          label: 'Message File Export',
          value: 'message-file-import',
          href: dawgRoutes?.messageDataManagement?.messageFileExport,
        },
      ],
    },
    {
      label: 'Report',
      value: 'report',
      subs: [
        {
          label: 'Bus Arrival Exception List',
          value: 'bus-arrival-exception-list',
          href: dawgRoutes?.report?.busArrival,
        },
      ],
    },
    {
      label: 'Maintenance',
      value: 'maintenance',
      subs: [
        {
          label: 'Diagnostics',
          value: 'diagnostics',
          href: dawgRoutes?.maintenance?.diagnostics,
        },
        // {
        //   label: 'EOD Process',
        //   value: 'eod-process',
        //   href: dawgRoutes?.maintenance?.eodProcess,
        // },
        // {
        //   label: 'Audit Log',
        //   value: 'audit-log',
        //   href: dawgRoutes?.maintenance?.auditLog,
        // },
        {
          label: 'System Info',
          value: 'system-info',
          href: dawgRoutes?.maintenance?.systemInformation,
        },
      ],
    },
  ];

  constructor(private eRef: ElementRef) {}

  ngOnInit(): void {
    // const profile = this.authService.fetchProfile() as UserProfile;
    // const formatData = profile.depot_list.map((item: any) => {
    //   return <IDepoList>{
    //     id: item.id,
    //     version: item.version,
    //     depot_id: item.depot_id,
    //     depot_code: item.depot_code,
    //     depot_name: item.depot_name,
    //     value: item.depot_name,
    //   };
    // });

    // this.depoService.updateDepoList(formatData);
    // this.depoService.updateDepo(formatData[0]?.depot_id);

    this.authService.fetchProfile().subscribe({
      next: (value: PayloadResponse) => {
        if (value.status == 200) {
          this.userProfile = value.payload['profile'];
        }
      },
      complete: () => {
        // this.depoService.depo$.subscribe((value: string) => {
        //   this.depotId = this.options.filter(x => x.depot_id == value)[0];
        // });
      },
    });

    this.depoService.search(this.params).subscribe({
      next: (value: PayloadResponse) => {
        if (value.status == 200) {
          const source = value.payload['depot_list'];
          const formatData = source.map((item: any) => {
            return <IDepoList>{
              id: item.id,
              version: item.version,
              depot_id: item.depot_id,
              depot_code: item.depot_code,
              depot_name: item.depot_name,
              value: item.depot_name,
            };
          });
          this.options = formatData;
          this.depoService.updateDepoList(formatData);
          this.depoService.updateDepo(formatData[0]?.depot_id);
        }
      },
      complete: () => {
        this.depoService.depo$.subscribe((value: string) => {
          this.depotId = this.options.filter(x => x.depot_id == value)[0];
        });
      },
    });
  }

  ngAfterViewInit() {
    this.setSideBarHeight();
  }

  @HostListener('window:resize')
  onResize() {
    this.setSideBarHeight();
  }

  setSideBarHeight() {
    const sideBar = this.document.querySelector('.mobile-nav') as HTMLElement;
    const mainContent = this.document.querySelector(
      '.main-container'
    ) as HTMLElement;
    sideBar.style.height = mainContent.clientHeight + 'px';
  }

  // busSelect(event: any) {
  //   this.depoService.updateDepo(event.depot_id);
  // }

  @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    if (!this.isOpenMobileMenu) return;

    const clickedInside = this.mobileNav?.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.isOpenMobileMenu = false;
    }
  }

  menuHandler(status: string, menu: string) {
    // console.log(status, menu);
    if (status == 'open') {
      this.expandedMenu[menu] = true;
    } else {
      this.expandedMenu[menu] = false;
    }
  }

  setActiveMu(menu: string) {
    this.activeMenu = menu;
  }

  checkNavActive(routeLink: string): boolean {
    return this.router.url.includes(routeLink);
  }

  toggleMobileMenu(event: Event) {
    event.stopPropagation();
    this.isOpenMobileMenu = !this.isOpenMobileMenu;
  }

  logOut() {
    this.authService.logout();
    this.router.navigate(['/sign-in']);
  }
}
