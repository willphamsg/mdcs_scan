import {
  AfterViewInit,
  Component,
  Inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DataListComponent } from '@app/components/data-list/data-list.component';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    DatePipe,
    MatIconModule,
    MatButtonModule,
    DataListComponent,
    RouterModule,
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements AfterViewInit {
  dagw = environment.dagw;

  currentDate: Date;
  isBrowser = signal(false);
  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser.set(isPlatformBrowser(platformId));
  }
  ngAfterViewInit(): void {
    if (this.isBrowser()) {
      setInterval(() => {
        this.currentDate = new Date();
      }, 1000);
    }
  }
}
