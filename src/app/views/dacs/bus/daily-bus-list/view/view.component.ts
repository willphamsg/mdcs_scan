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
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import DayType from '@data/day-type.json';
import { BusList, IBustList } from '@models/bus-list';
import { IDepoList } from '@models/depo';
import { DepoRequest, DropdownList, PayloadResponse } from '@models/common';
import { DepoService } from '@services/depo.service';
import { ManageDailyBusListService } from '@services/manage-daily-bus-list.service';
import { MessageService } from '@services/message.service';
import { AppStore } from '@store/app.state';
import { Store } from '@ngrx/store';
import { showSnackbar } from '@store/snackbar/snackbar.actions';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonService } from '@app/services/common.service';

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
    DatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewComponent implements OnInit {
  @ViewChild(MatTable) _matTable: MatTable<any>;
  myForm: FormGroup;
  isUpdate: boolean = false;
  isDelete: boolean = false;
  rowCount: number = 1;
  depotId: string;
  errMsg: string;
  depots: IDepoList[] = [];
  params: DepoRequest = {
    patternSearch: false,
    search_text: '',
    is_pattern_search: false,
    page_size: 100,
    page_index: 0,
    sort_order: [],
  };
  serviceNumOptions: string[] = ['25', '30', '40'];
  options: DropdownList[] = [];
  arrivalCountOptions: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  displayedColumns = [
    'depot_id',
    'bus_num',
    'service_num',
    'day_type',
    'est_arrival_time',
    'est_arrival_count',
    'action',
  ];
  isDisabled: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private manageDailyBusListService: ManageDailyBusListService,
    private depoService: DepoService,
    private commonService: CommonService,
    private message: MessageService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ViewComponent>,
    private _snackBar: MatSnackBar,
    private store: Store<AppStore>
  ) {
    this.depoService.depo$.subscribe((value: string) => {
      this.depotId = value;
    });
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

    this.options = DayType.map((item: any) => {
      return <DropdownList>{
        id: item.id,
        value: item.value,
      };
    });

    if (this.data != null && this.data.selection?.length > 0) {
      if (this.data.action === 'delete') {
        this.isDelete = true;
        this.displayedColumns.pop();
      } else {
        this.isUpdate = true;
      }

      this.data.selection.forEach((element: any) => {
        this.items.push(this.existingItems(element));
      });
      this.rowCount = this.items.length;
    } else {
      this.addItem();
    }
  }

  OnDestroy(): void {
    this.dialog.closeAll();
  }

  get items(): FormArray {
    return this.myForm.get('items') as FormArray;
  }

  getDepotName(id: string): string {
    const depotName = this.depots?.filter(item => item?.depot_id === id);
    return depotName[0]?.depot_name;
  }

  existingItems(element: IBustList): FormGroup {
    return this.fb.group({
      id: element.id,
      version: element.version,
      depot_id: [{ value: element.depot_id, disabled: true }],
      depot_name: element.depot_name,
      bus_num: [{ value: element.bus_num, disabled: true }],
      // bus_num: element.bus_num,
      service_num: [{ value: element.service_num, disabled: this.isDelete }],
      svc_prov_id: element.svc_prov_id,
      day_type: [{ value: element.day_type, disabled: true }],
      day: element.day,
      est_arrival_time: element.est_arrival_time,
      est_arrival_count: [
        { value: element.est_arrival_count, disabled: this.isDelete },
      ],
      updated_on: element.updated_on,
    });
  }

  newItems(): FormGroup {
    return this.fb.group(new BusList());
  }

  addItem() {
    const newItem = this.newItems();
    newItem.controls['depot_id'].setValue(this.depotId);
    this.items.push(newItem);
    this.reRenderTable();
  }

  removeItem(i: number) {
    if (this.items.length > 1) {
      this.items.removeAt(i);
      this.reRenderTable();
    }
  }

  reRenderTable(): void {
    if (this._matTable != undefined) {
      this._matTable.renderRows();
      this.rowCount = this.items.length;
    }
  }

  handleBusValidate(e: any) {
    return this.commonService.validateBusNumber(e);
  }

  onSubmit() {
    this.myForm.markAllAsTouched();
    if (this.myForm.valid && this.items.length > 0) {
      if (this.myForm.value.items.length <= 0) {
        this.message.confirmation('Warning', 'No Record To Save');
      } else {
        this.manageDailyBusListService
          .manage(this.myForm.getRawValue().items, this.data.action)
          .subscribe({
            next: (value: PayloadResponse) => {
              const resp = this.message.MessageResponse(value, false);
              if (resp) {
                this.dialog.closeAll();
              }
            },
            error: (err: HttpErrorResponse) => {
              this.message.multiError(err);
            },
          });
      }
    }
  }
}
