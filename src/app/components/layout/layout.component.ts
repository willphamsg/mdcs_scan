import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { RouterOutlet, Router } from '@angular/router';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { SnackbarComponent } from '@components/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppStore } from '@store/app.state';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { showSnackbar } from '@store/snackbar/snackbar.actions';

@Component({
    selector: 'app-layout',
    imports: [
        HeaderComponent,
        FooterComponent,
        RouterOutlet,
        MatSnackBarModule,
    ],
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  @ViewChild('container') container: ElementRef;

  constructor(
    private snackBar: MatSnackBar,
    private store: Store<AppStore>,
    private router: Router
  ) {
    this.store.select('snackbar').subscribe((state: any) => {
      // console.log('state', state);
      if (state?.show) {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: {
            message: state?.message,
            type: state?.typeSnackbar,
            title: state?.title,
          },
          duration: 3000,
          panelClass: [
            'custom-snackbar',
            `${state?.typeSnackbar === 'success' ? 'custom-snackbar-success' : 'custom-snackbar-error'}`,
          ],
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      }
    });
  }

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      if (this.container) {
        this.container.nativeElement.scrollTop = 0;
        this.container.nativeElement.scrollLeft = 0;
      }
    });
  }

  openSnackBar(isArray?: boolean) {
    this.store.dispatch(
      showSnackbar({
        message: isArray
          ? [
              {
                title: 'error 1',
                message: 'error message 1',
              },
              {
                title: 'error 1',
                message: 'error message 1',
              },
            ]
          : 'sample message',
        title: 'sample title',
        typeSnackbar: isArray ? 'error' : 'success',
      })
    );
  }
}
