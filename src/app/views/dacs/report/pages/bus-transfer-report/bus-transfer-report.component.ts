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
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
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
import { IFilterConfig, createFormGroup } from '@app/shared/utils/form-utils';
import { Subject, switchMap, takeUntil } from 'rxjs';

@Component({
    selector: 'app-bus-transfer-report',
    imports: [
        MatTableModule,
        MatCardModule,
        MatToolbarModule,
        MatTabsModule,
        MatMenuModule,
        MatDividerModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
        MatButtonModule,
        CommonModule,
        MatInputModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
    ],
    templateUrl: './bus-transfer-report.component.html',
    styleUrl: './bus-transfer-report.component.scss'
})
export class BusTransferReportComponent implements OnInit {
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
      .subscribe(formValue => {});
  }

  loadConfigs(): void {
    this.configs = [
      {
        controlName: 'currDepot',
        value: '',
        type: 'select',
        options: this.depots,
        validators: [Validators.required],
      },
      {
        controlName: 'currOperator',
        value: [],
        type: 'select',
        validators: [Validators.required],
      },
      {
        controlName: 'futureOperator',
        value: [],
        type: 'select',
        validators: [Validators.required],
      },
      {
        controlName: 'startDate',
        value: [],
        type: 'date-picker',
        validators: [Validators.required],
      },
      {
        controlName: 'endDate',
        value: [],
        type: 'date-picker',
        validators: [Validators.required],
      },
    ];

    this.adhocForm = createFormGroup(this.configs);
  }
}
