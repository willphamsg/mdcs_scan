import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { IFilterConfig, createFormGroup } from '@app/shared/utils/form-utils';
import { Subject, switchMap, takeUntil } from 'rxjs';

@Component({
    selector: 'app-daily-bus-list-report',
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
        RouterModule,
        ReactiveFormsModule,
        MatInputModule,
    ],
    templateUrl: './daily-bus-list-report.component.html',
    styleUrl: './daily-bus-list-report.component.scss'
})
export class DailyBusListReportComponent implements OnInit {
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

  get depotValue(): string {
    return this.adhocForm?.get('depots')?.value;
  }

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
}
