import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { DropdownList } from '@app/models/common';
import { IDepoList } from '@app/models/depo';
import { DepoService } from '@app/services/depo.service';
import { createFormGroup, IFilterConfig } from '@app/shared/utils/form-utils';
import { BreadcrumbsComponent } from '@app/components/layout/breadcrumbs/breadcrumbs.component';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

// import { saveAs } from 'file-saver/dist/FileSaver';
// import FileSaver from 'file-saver';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-bus-arrival-exception-list',
  imports: [
    MatTableModule,
    MatCardModule,
    MatToolbarModule,
    MatTabsModule,
    MatMenuModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    MatInputModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    BreadcrumbsComponent,
    MatDatepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './bus-arrival-exception-list.component.html',
  styleUrl: './bus-arrival-exception-list.component.scss',
})
export class BusArrivalExceptionListComponent implements OnInit {
  destroy$ = new Subject<void>();
  adhocForm!: FormGroup;
  depots: IDepoList[] = [];
  configs: IFilterConfig[] = [];

  spName: DropdownList[] = [
    {
      id: 't1',
      value: 'Tower Transit Bus Operator',
    },
    {
      id: 't2',
      value: 'SBST bus Service Provider',
    },
  ];

  dateSelected: string = '';

  isDownloading = false;
  pdfUrlBlob =
    'https://staging.safegold.com/display/sales-invoice/da771e90-aa8f-4147-bc7c-805b73bb1283';
  pdfUrl3: SafeResourceUrl = 'https://www.africau.edu/images/default/sample.pdf';
  fileURL = null;
  isToggle = false;

  docTypes = ['URL', 'Blob', 'ArrayBuffer', 'File System', 'Base64 data'];

  constructor(
    private depotService: DepoService,
    public dialog: MatDialog,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  get depotValue(): string {
    return this.adhocForm?.get('depots')?.value;
  }

  ngOnInit(): void {
      const url = 'https://www.africau.edu/images/default/sample.pdf';
        this.pdfUrl3 = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.loadSelections();
  }

  loadSelections(): void {
    this.depotService.depoList$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(depots => {
          this.depots = depots;
          this.loadConfigs();
          return this.adhocForm.valueChanges;
        })
      )
      .subscribe(formValue => {});
  }

  loadConfigs(): void {
    this.configs = [
      {
        controlName: 'depots',
        value: '',
        type: 'select',
        options: this.depots,
        validators: [Validators.required],
      },
      {
        controlName: 'spName',
        value: [],
        type: 'select',
        options: this.spName,
        validators: [Validators.required],
      },
    ];

    this.adhocForm = createFormGroup(this.configs);
  }

  handleChangeDate(event: any) {
    this.dateSelected = event.value;
  }
}
