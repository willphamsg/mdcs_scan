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
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';
import { DropdownList, PayloadResponse } from '@models/common';
import {
  IVehicleDelete,
  IVehicleList,
  VehicleInfo,
  VehicleList,
  VehicleStatusEnum,
  VehicleStatusLabelMapping,
} from '@models/vehicle-list';
import { IDepoList } from '@models/depo';
import { DepoService } from '@services/depo.service';
import { MasterService } from '@services/master.service';
import { MessageService } from '@services/message.service';
import db from '@data/db.json';
import { AppStore } from '@store/app.state';
import { Store } from '@ngrx/store';
import { showSnackbar } from '@store/snackbar/snackbar.actions';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonService } from '@app/services/common.service';
import {
  CommonDialogComponent,
  ConfirmDialogModel,
} from '@app/components/common-dialog/common-dialog.component';

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
        MatButtonModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        NgxMatTimepickerModule,
        MatTabsModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {
  myForm: FormGroup;
  @ViewChild(MatTable) _matTable: MatTable<any>;
  rowCount: number = 1;
  displayedColumns = ['parameterName', 'version', 'status', 'description'];
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
  tabIdx = 0;
  successDataSource: any[] = [];
  failedDataSource: any[] = [];

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private masterService: MasterService,
    private depoService: DepoService,
    private commonService: CommonService,
    private message: MessageService,
    private store: Store<AppStore>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.successDataSource = this.data['success_files'];
    this.failedDataSource = this.data['failed_files'];
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.tabIdx = event.index;
  }

  onSubmit() {
    this.dialog.closeAll();
  }

  handleCancelDownload() {
    const dialogRef = this.dialog.open(CommonDialogComponent, {
      width: '100%',
      height: '100%',
      maxHeight: '300px',
      maxWidth: '576px',
      panelClass: ['force-eod-dialog'],
      autoFocus: 'first-heading',
      disableClose: true,
      data: new ConfirmDialogModel(
        'Cancel File Download?',
        'By clicking "Yes" button, you won’t be able to access the download link and will need to redo the export process.',
        [],
        false,
        'No',
        'Yes'
      ),
    });

    dialogRef.afterClosed().subscribe(isSubmit => {
      if (isSubmit) {
        this.dialog.closeAll();
      }
    });
  }
}
