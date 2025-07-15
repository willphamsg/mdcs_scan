import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
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

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterModule,
    MatSelectModule,
    FormsModule,
    MatSidenav,
    MatListModule,
    NgFor,
    NgIf,
    CommonModule,
    MatBadgeModule,
    NotificationComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private depoService = inject(DepoService);
  private commonService = inject(CommonService);
  private messageService = inject(MessageService);

  private router = inject(Router);
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

  constructor() {}

  ngOnInit(): void {
    const profile = this.authService.fetchProfile() as UserProfile;
    const formatData = profile.depot_list.map((item: any) => {
      return <IDepoList>{
        id: item.id,
        version: item.version,
        depot_id: item.depot_id,
        depot_code: item.depot_code,
        depot_name: item.depot_name,
        value: item.depot_name,
      };
    });

    this.depoService.updateDepoList(formatData);
    this.depoService.updateDepo(formatData[0]?.depot_id);

    // this.depoService.search(this.params).subscribe({
    //   next: (value: PayloadResponse) => {
    //     if (value.status == 200) {
    //       const source = value.payload['depot_list'];
    //       const formatData = source.map((item: any) => {
    //         return <IDepoList>{
    //           id: item.id,
    //           version: item.version,
    //           depot_id: item.depot_id,
    //           depot_code: item.depot_code,
    //           depot_name: item.depot_name,
    //           value: item.depot_name,
    //         };
    //       });
    //       this.options = formatData;
    //       this.depoService.updateDepoList(formatData);
    //       this.depoService.updateDepo(formatData[0]?.depot_id);
    //     }
    //   },
    //   complete: () => {
    //     this.depoService.depo$.subscribe((value: string) => {
    //       this.depotId = this.options.filter(x => x.depot_id == value)[0];
    //     });
    //   },
    // });
  }

  // busSelect(event: any) {
  //   this.depoService.updateDepo(event.depot_id);
  // }

  menuHandler(status: string, menu: string) {
    if (status == 'open') {
      this.expandedMenu[menu] = true;
    } else {
      this.expandedMenu[menu] = false;
    }
  }

  setActiveMu(menu: string) {
    this.activeMenu = menu;
  }

  logOut() {
    this.authService.logout();
    this.router.navigate(['/sign-in']);
  }
}
