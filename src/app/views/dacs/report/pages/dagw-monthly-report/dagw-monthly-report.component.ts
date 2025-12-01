import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  provideNativeDateAdapter,
} from '@angular/material/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import {
  MatDatepicker,
  MatDatepickerModule,
  MatDateRangePicker,
} from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { IDepoList } from '@app/models/depo';
import { DepoService } from '@app/services/depo.service';
import { IFilterConfig, createFormGroup } from '@app/shared/utils/form-utils';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { MONTH_FORMATS } from '@app/shared/utils/date-time';

@Component({
    selector: 'app-dagw-monthly-report',
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
        MatCheckboxModule,
        MatExpansionModule,
        MatDatepickerModule,
        MatNativeDateModule,
        CommonModule,
        MatInputModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
    ],
    templateUrl: './dagw-monthly-report.component.html',
    styleUrl: './dagw-monthly-report.component.scss',
    providers: [
        provideNativeDateAdapter(),
        { provide: MAT_DATE_FORMATS, useValue: MONTH_FORMATS },
        { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    ]
})
export class DagwMonthlyReportComponent implements OnInit {
  destroy$ = new Subject<void>();
  adhocForm!: FormGroup;
  depots: IDepoList[] = [];
  configs: IFilterConfig[] = [];
  monthCtrl = new FormControl<Date | null>(null);

  constructor(private depotService: DepoService) {}

  ngOnInit(): void {
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
      .subscribe(formValue => {
        console.log(formValue);
      });
  }

  loadConfigs(): void {
    this.configs = [
      {
        controlName: 'depots',
        value: [],
        type: 'select',
        options: this.depots,
        validators: [Validators.required],
      },
      {
        controlName: 'monthType',
        value: '',
        type: 'select',
        validators: [Validators.required],
      },
    ];

    this.adhocForm = createFormGroup(this.configs);
  }

  chosenMonthHandler(normalizedMonth: Date, datepicker: MatDatepicker<Date>) {
    const selected = new Date(
      normalizedMonth.getFullYear(),
      normalizedMonth.getMonth(),
      1
    );
    console.log({ selected });
    this.monthCtrl.setValue(selected);
    datepicker.close();
  }
}
