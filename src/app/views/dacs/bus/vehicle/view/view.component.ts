import { CommonModule, DatePipe } from '@angular/common';
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
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTable, MatTableModule } from '@angular/material/table';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { DropdownList, PayloadResponse } from '../../../../../models/common';
import {
  IVehicleDelete,
  IVehicleList,
  VehicleInfo,
  VehicleList,
  VehicleStatusEnum,
  VehicleStatusLabelMapping,
} from '../../../../../models/vehicle-list';
import { IDepoList } from '../../../../../models/depo';
import { DepoService } from '../../../../../services/depo.service';
import { MasterService } from '../../../../../services/master.service';
import { MessageService } from '../../../../../services/message.service';
import db from '../../../../../data/db.json';
import { AppStore } from '@store/app.state';
import { Store } from '@ngrx/store';
import { showSnackbar } from '@store/snackbar/snackbar.actions';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonService } from '@app/services/common.service';

@Component({
    selector: 'app-view',
    providers: [provideNativeDateAdapter()],
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatDividerModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatTableModule,
        MatDialogActions,
        MatDialogContent,
        MatDialogClose,
        MatButtonModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        NgxMatTimepickerModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {
  myForm: FormGroup;
  @ViewChild(MatTable) _matTable: MatTable<any>;
  rowCount: number = 1;
  displayedColumns = [
    'depot_id',
    'bus_num',
    'effective_date',
    'effective_time',
    // 'status',
    // 'action',
  ];
  depotId: string;
  depots: IDepoList[] = [];
  statusOptions: DropdownList[] = Object.values(VehicleStatusEnum).map(_s => ({
    id: _s,
    value: VehicleStatusLabelMapping[_s],
  }));
  isDisabled: boolean = false;
  isDelete: boolean = false;
  minDate = new Date();
  minTime: string = '';
  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private masterService: MasterService,
    private depoService: DepoService,
    private commonService: CommonService,
    private message: MessageService,
    private store: Store<AppStore>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.depoService.depo$.subscribe((value: string) => {
      this.depotId = value;
    });

    this.depoService.depoList$.subscribe((value: IDepoList[]) => {
      this.depots = value;
    });
    this.minTime = new DatePipe('en-US').transform(new Date(), 'hh:mm a') || '';
  }

  ngOnInit() {
    this.myForm = this.fb.group({
      items: this.fb.array([]),
    });

    if (this.data != null && this.data.selection?.length > 0) {
      this.isDelete = this?.data?.action === 'delete';
      this.data.selection.forEach((element: any) => {
        this.items.push(this.existingItems(element));
      });
      this.rowCount = this.items.length;
      this.isDisabled = true;
    } else {
      this.addItem();
    }
    if (!this.isDelete) {
      this.displayedColumns.push('action');
    } else {
      this.displayedColumns = this.displayedColumns.filter(
        item => item !== 'effective_time'
      );
    }
  }

  busHandler(index: number) {
    const items = this.myForm.get('items') as FormArray;
    this.masterService
      .find({
        bus_num: items.controls[index].get('bus_num')?.value,
        depot_id: this.depotId,
        svc_prov_id: sessionStorage.getItem('svdProvId'),
      })
      .subscribe({
        next: (value: PayloadResponse) => {
          if (value.status == 200) {
            items.controls[index].get('status')?.patchValue(value.status_code);
            if (value.status_code == 'INFO 3078') {
              items.controls[index].get('hidden')?.patchValue(true);
              const source = value.payload['master_bus_entry'] as VehicleList;
              items.controls[index]
                .get('effective_date')
                ?.patchValue(source.effective_date);
            }
          } else {
            items.controls[index].get('status')?.patchValue('Error!');
          }
        },
      });
  }

  removeItem(i: number) {
    this.items.removeAt(i);
    this.reRenderTable();
  }

  addItem() {
    const newItem = this.newItems();
    newItem.controls['depot_id'].setValue(this.depotId);
    this.items.push(newItem);
    this.reRenderTable();
  }

  reRenderTable(): void {
    if (this._matTable != undefined) {
      this._matTable.renderRows();
      this.rowCount = this.items.length;
    }
  }

  newItems(): FormGroup {
    return this.fb.group(new VehicleList());
  }

  existingItems(element: IVehicleList): FormGroup {
    const d = new DatePipe('en-US').transform(
      element.effective_date,
      'yyyy-MM-dd'
    );
    const t = new DatePipe('en-US').transform(
      element.effective_date,
      'hh:mm a'
    );
    return this.fb.group({
      id: element.id,
      // version: element.version,
      bus_num: element.bus_num,
      depot_id: element.depot_id,
      // group_num: element.group_num,
      // svc_prov_id: element.svc_prov_id,
      effective_date: d,
      effective_time: t,
      // updated_on: element.updated_on,
      // status: element.status,
      hidden: false,
    });
  }

  get items(): FormArray {
    return this.myForm.get('items') as FormArray;
  }

  getstatusValue(index: number) {
    const items = this.myForm.get('items') as FormArray;
    const value = items.controls[index].get('status')?.value;
    if (value == 'INFO 3063') {
      return 'New Record';
    } else if (value == 'INFO 3078') {
      return 'Exist on other Depo';
    } else if (value == 'INFO 3079') {
      return 'Bus Transfer';
    } else if (value == 'INFO 3077') {
      return 'Duplicate Please Remove';
    }
    return '';
  }

  getHiddenValue(index: number) {
    const items = this.myForm.get('items') as FormArray;
    return items.controls[index].get('hidden')?.value;
  }

  getDateValue(index: number) {
    const items = this.myForm.get('items') as FormArray;
    return items.controls[index].get('effective_date')?.value;
  }

  getDepotName(id: string): string {
    const depotName = this.depots?.filter(item => item?.depot_id === id);
    return depotName[0]?.depot_name;
  }

  onSubmit() {
    this.myForm.markAllAsTouched();
    if (this.myForm.valid) {
      // const duplicate = this.myForm.value.items.filter(
      //   (item: VehicleList) =>
      //     typeof item.status === 'string' && item.status === 'INFO 3077'
      // );

      // if (duplicate.length > 0) {
      //   this.message.confirmation('Warning', 'Please Remove Duplicate Entry');
      //   return;
      // }
      const obj = this.myForm.getRawValue().items.map((item: VehicleInfo) => {
        const d = new DatePipe('en-US').transform(
          item.effective_date,
          'yyyy-MM-dd'
        );
        const t = new DatePipe('en-US').transform(
          new Date(d + ' ' + item.effective_time),
          'HH:mm:ss'
        );
        return <VehicleInfo>{
          depot_id: item.depot_id,
          bus_num: item.bus_num,
          svc_prov_id: item.svc_prov_id,
          effective_date: d + ' ' + t,
          group_num: item.group_num,
          updated_on: item.updated_on,
        };
      });
      if (obj.length <= 0) {
        this.message.confirmation('Warning', 'No Record To Save');
      } else {
        if (this.isDelete) {
          const obj = this.myForm
            .getRawValue()
            .items.map((item: IVehicleDelete) => {
              return <IVehicleDelete>{
                id: item.id,
                version: item.version,
                depot_id: item.depot_id,
              };
            });
          this.masterService.delete(obj).subscribe({
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
        } else {
          this.masterService.add(obj).subscribe({
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

  handleBusValidate(e: any) {
    return this.commonService.validateBusNumber(e);
  }

  onTimeChange(time: string, index: number) {
    const items = this.myForm.get('items') as FormArray;
    items.controls[index].get('effective_time')?.setValue(time);
  }

  handleMinTime(e: any) {
    const selected = new Date(e.value.toDateString());
    const min = new Date(this.minDate.toDateString());

    if (selected > min) {
      this.minTime = '00:00';
    } else {
      this.minTime =
        new DatePipe('en-US').transform(new Date(), 'hh:mm a') || '';
    }
  }
}
