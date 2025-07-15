import { AsyncPipe, NgFor, NgIf, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { IBusTransferList } from '../../../../../models/bus-transfer';
import { IDepoList } from '../../../../../models/depo';
import { DepoRequest, PayloadResponse } from '../../../../../models/common';
import { DepoService } from '../../../../../services/depo.service';
import { ManageBusTransferService } from '../../../../../services/bus-transfer.service';
import { MessageService } from '../../../../../services/message.service';
import { AppStore } from '@store/app.state';
import { Store } from '@ngrx/store';
import { showSnackbar } from '@store/snackbar/snackbar.actions';
@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    RouterModule,
    NgFor,
    NgIf,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatIcon,
    AsyncPipe,
    MatDividerModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogClose,
    MatTableModule,
    MatIconModule,
    MatDatepickerModule,
    MatTooltipModule,
    NgxMatTimepickerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusTransferViewComponent implements OnInit {
  @ViewChild(MatTable) _matTable: MatTable<any>;
  myForm: FormGroup;
  mode: string = '';
  rowCount: number = 1;
  depots: IDepoList[] = [];
  isEdit: boolean = false;
  params: DepoRequest = {
    patternSearch: false,
    search_text: '',
    is_pattern_search: false,
    page_size: 100,
    page_index: 0,
    sort_order: [],
  };
  displayedColumns = [
    'bus_num',
    'current_depot',
    'current_operator',
    'current_effective_date',
    'future_depot',
    'future_operator',
    'target_effective_date',
    'target_effective_time',
  ];

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private manageBusTransferService: ManageBusTransferService,
    private depoService: DepoService,
    private message: MessageService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<BusTransferViewComponent>,
    private store: Store<AppStore>
  ) {
    this.depoService.depoList$.subscribe((value: IDepoList[]) => {
      this.depots = value;
    });
  }

  title: string;

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  ngOnInit(): void {
    this.title = this.data.title;

    this.myForm = this.fb.group({
      items: this.fb.array([]),
    });

    if (this.data != null && this.data.selection?.length > 0) {
      if (this.data.action !== 'update') {
        this.displayedColumns.pop();
      }
      this.data.selection.forEach((element: any) => {
        this.items.push(this.existingItems(element));
      });
      this.mode = this.data.action;
      this.rowCount = this.items.length;
      this.isEdit = this.data?.action === 'update';
    }
  }

  OnDestroy(): void {
    this.dialog.closeAll();
  }

  get items(): FormArray {
    return this.myForm.get('items') as FormArray;
  }

  existingItems(element: IBusTransferList): FormGroup {
    return this.fb.group({
      id: element.id,
      version: element.version,
      //depot_id: [{ value: element.depot_id, disabled: true }],
      bus_num: [{ value: element.bus_num, disabled: true }],
      bus_id: element.bus_id,
      current_depot: element.current_depot,
      current_depot_name: element.current_depot_name,
      current_operator: element.current_operator,
      current_operator_name: element.current_operator_name,
      current_effective_date: [
        {
          value: new DatePipe('en-US').transform(
            element.current_effective_date,
            'dd/MM/yyyy HH:mm'
          ),
          disabled: true,
        },
      ],
      future_depot: element.future_depot,
      future_depot_name: element.future_depot_name,
      future_operator: element.future_operator,
      future_operator_name: element.future_operator_name,
      target_effective_date:
        this.data.action === 'update'
          ? new DatePipe('en-US').transform(
              element.future_effective_date,
              'dd/MM/yyyy'
            )
          : [
              {
                value: new DatePipe('en-US').transform(
                  element.future_effective_date,
                  'dd/MM/yyyy HH:mm'
                ),
                disabled: true,
              },
            ],
      target_effective_time: new DatePipe('en-US').transform(
        element.future_effective_date,
        'HH:mm a'
      ),
      future_effective_date: [
        {
          value: new DatePipe('en-US').transform(
            element.future_effective_date,
            'dd/MM/yyyy HH:mm'
          ),
          disabled: true,
        },
      ],
      status: element.status,
    });
  }

  reRenderTable(): void {
    if (this._matTable != undefined) {
      this._matTable.renderRows();
      this.rowCount = this.items.length;
    }
  }

  timeHandler(time: string, index: number) {
    const control = this.items.controls[index];
    const date = new DatePipe('en-US').transform(
      control.getRawValue().target_effective_date,
      'dd/MM/yyyy'
    );

    control.patchValue({
      future_effective_date: new DatePipe('en-US').transform(
        date + ' ' + time,
        'dd/MM/yyyy HH:mm'
      ),
    });
  }

  onSubmit() {
    this.myForm.markAllAsTouched();
    if (this.myForm.value.items.length <= 0) {
      this.message.confirmation('Warning', 'No Record To Save');
    } else {
      this.manageBusTransferService
        .manage(this.myForm.getRawValue().items, this.data.action)
        .subscribe({
          next: (value: PayloadResponse) => {
            if (value.status == 201) {
              this.store.dispatch(
                showSnackbar({
                  message:
                    this.data.action === 'reject'
                      ? 'Records have been successfully rejected'
                      : `Records have been successfully ${this.data.action || 'adde'}d!`,
                  title: 'Success',
                  typeSnackbar: 'success',
                })
              );
              this.dialog.closeAll();
            } else {
              this.store.dispatch(
                showSnackbar({
                  message:
                    this.data.action === 'reject'
                      ? 'Records have been successfully rejected'
                      : `Records have been successfully ${this.data.action || 'adde'}d!`,
                  title: 'Success',
                  typeSnackbar: 'success',
                })
              );
              this.dialog.closeAll();
            }
          },
        });
    }
  }
}
