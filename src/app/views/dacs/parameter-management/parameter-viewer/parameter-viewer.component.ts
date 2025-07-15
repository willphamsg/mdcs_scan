import { NgIf, CommonModule, NgFor } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  viewChild,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { BreadcrumbsComponent } from '@app/components/layout/breadcrumbs/breadcrumbs.component';
import { ClickStopPropagationDirective } from '@app/directives/click-stop-propagation.directive';
import { IBustList } from '@app/models/bus-list';
import { IDepoList } from '@app/models/depo';
import {
  IParameterViewerItems,
  IParameterList,
  IParameterBfcConfig,
  IParameterViewerData,
  IParameterDepotItems,
  IParameterTab,
} from '@app/models/parameter-management';
import { ParameterViewerService } from '@app/services/parameter-viewer.service';
import { Observable, of, map, Subscription, Subject, takeUntil } from 'rxjs';
import { ApplicationParametersComponent } from './application-parameters/application-parameters.component';
import { DeviceConfigurationComponent } from './device-configuration/device-configuration.component';
import { SystemParametersComponent } from './system-parameters/system-parameters.component';
import {
  IValidatorConfig,
  removeValidator,
  setFormValidators,
} from '@app/shared/utils/form-utils';
import { environment } from '@env/environment';

@Component({
  selector: 'app-parameter-viewer',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    RouterModule,
    MatInputModule,
    MatSelectModule,
    MatSortModule,
    MatExpansionModule,
    CommonModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
    SystemParametersComponent,
    DeviceConfigurationComponent,
    ApplicationParametersComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './parameter-viewer.component.html',
  styleUrls: ['./parameter-viewer.component.scss'],
})
export class ParameterViewerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  accordion = viewChild.required(MatAccordion);

  parameterDeviceItems: IParameterViewerItems[] = [];
  parameterList$: Observable<IParameterList[]> = of([]);
  busList$: Observable<IBustList[]> = of([]);
  depots$: Observable<IDepoList[]> = of([]);

  tabIdx = 0;
  tabList: IParameterTab[] = [];

  sideNavHeader = 0;
  menuHeader: string;
  displayedColumns: string[] = [
    'fileId',
    'parameterName',
    'parameterVersion',
    'formatVersion',
    'effectiveDateTime',
  ];

  dataSource: IParameterViewerData | null = null;
  dataSourceDetails: any[] = [];
  payload: any;
  selected: number | undefined;
  selectedItem: string = '';
  selectedDevice: string | null = null;
  deviceConfigFormGroup: FormGroup = this.fb.group({
    depot: [''],
    parameterName: [''],
    busType: [''],
  });

  // TODO: Refactor retrieval of data... Probably use services efficiently
  constructor(
    private parameterViewerService: ParameterViewerService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setActiveTab();
    this.loadTabItems();
    //this.loadParameterItems(this.sideNavHeader);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.accordion().closeAll();
    this.cdr.detectChanges();

    const selectedTab = this.tabList.find(
      tab => tab.label === event.tab.textLabel
    );
    if (selectedTab) {
      this.menuHeader = selectedTab.label;
      this.sideNavHeader = selectedTab.id;
      this.loadParameterItems(this.sideNavHeader);
    }
  }

  loadTabItems(): void {
    this.parameterViewerService.getSystemParametersTab().subscribe({
      next: value => {
        if (value.status === 200) {
          this.tabList = value.payload.tabList;
          this.sideNavHeader = value.payload.tabList[0].id;
        }
      },
      complete: () => {
        this.loadParameterItems(this.sideNavHeader);
      },
    });
  }

  loadParameterItems(tabCode: number): void {
    this.parameterViewerService.getSystemParametersItems(tabCode).subscribe({
      next: value => {
        if (value.status === 200) {
          this.parameterDeviceItems = value.payload.devices;
        }
      },
    });
  }

  setDepotList(item: string): void {
    this.depots$ = this.parameterViewerService
      .getDepotData(item)
      .pipe(map((data: IParameterDepotItems) => data?.items));
  }

  setActiveTab(): void {
    this.tabIdx = this.tabList.findIndex(idx => idx.id === this.sideNavHeader);
  }

  onSelectItem(device: IParameterViewerItems, deviceCode: string): void {
    this.resetForm();
    this.selectedItem = deviceCode;
    this.selectedDevice = device.device_type;

    this.dataSource = null;
    this.dataSourceDetails = [];

    this.setDepotList(deviceCode);

    if (environment?.useDummyData) {
      this.parameterList$ =
        this.parameterViewerService.getParameterList(deviceCode);

      this.configureFormForDevice(deviceCode, device.device_type);

      this.subscribeToFormChanges(deviceCode, device.device_type);
    } else {
      this.loadData(device, deviceCode);
    }
  }

  private resetForm(): void {
    this.deviceConfigFormGroup.reset();
    this.deviceConfigFormGroup.disable();
  }

  private configureFormForDevice(deviceCode: string, deviceType: string): void {
    this.deviceConfigFormGroup.enable();

    this.resetFormValidators();

    const defaultValidatorConfig: IValidatorConfig = {
      depot: [Validators.required],
    };
    setFormValidators(this.deviceConfigFormGroup, defaultValidatorConfig);

    if (deviceType === 'device_config') {
      this.busList$ = this.parameterViewerService.getBusList('');

      const validatorConfig: IValidatorConfig = {
        busType: [Validators.required],
      };
      setFormValidators(this.deviceConfigFormGroup, validatorConfig);
    } else if (deviceCode === 'bus_cash_fare') {
      const validatorConfig: IValidatorConfig = {
        parameterName: [Validators.required],
      };
      setFormValidators(this.deviceConfigFormGroup, validatorConfig);
    }
  }

  private resetFormValidators(): void {
    Object.keys(this.deviceConfigFormGroup.controls).forEach(controlName => {
      removeValidator(this.deviceConfigFormGroup, controlName);
    });
  }

  private subscribeToFormChanges(deviceCode: string, deviceType: string): void {
    this.deviceConfigFormGroup.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.dataSource = null;

        const requiredFields = this.getRequiredFieldsForDeviceType(
          deviceCode,
          deviceType
        );

        const allRequiredFieldsValid = requiredFields.every(
          field => this.deviceConfigFormGroup.get(field)?.valid
        );

        if (allRequiredFieldsValid) {
          this.parameterViewerService
            .getSelectedDepotData(
              this.deviceConfigFormGroup.get('depot')?.value
            )
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: IParameterViewerData) => {
              this.dataSource = res;
              this.fetchDataBasedOnSelection();
            });
        }
      });
  }

  private getRequiredFieldsForDeviceType(
    deviceCode: string,
    deviceType: string
  ): string[] {
    if (deviceType === 'device_config') {
      return ['depot', 'busType'];
    } else if (deviceCode === 'bus_cash_fare') {
      return ['depot', 'parameterName'];
    }

    return ['depot'];
  }
  loadData(device: IParameterViewerItems, deviceCode: string) {
    const item = device.device_items.find(x => x.item_code == deviceCode);
    this.parameterViewerService.getDataSource(item?.id).subscribe({
      next: value => {
        if (value.status === 200) {
          this.dataSource = value.payload.ParameterViewObject;

          this.parameterList$ = this.parameterViewerService.getParameterList(
            value.payload.ParameterViewObject.parameter_name
          );

          this.payload = value.payload.ParameterViewObject.parameterPayloadDto;
          this.selected = item?.id;
        }
      },
    });
  }

  private fetchDataBasedOnSelection(): void {
    const depot = this.deviceConfigFormGroup.get('depot')?.value;
    const parameterName =
      this.deviceConfigFormGroup.get('parameterName')?.value;
    const busType = this.deviceConfigFormGroup.get('busType')?.value;

    switch (this.selectedItem) {
      case 'bus_cash_fare':
        this.fetchBusCashFareDetails(depot, parameterName);
        break;

      case 'DAGW_UA':
        this.fetchUserAccessDetails();
        break;

      case 'DAGW_BFCID':
        this.fetchParameterBfcConfig(parameterName, depot, busType);
        break;

      default:
    }
  }

  private fetchBusCashFareDetails(depot: string, parameterName: string): void {
    this.parameterViewerService
      .getBusCashFareDetails(depot, parameterName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => (this.dataSourceDetails = res));
  }

  private fetchUserAccessDetails(): void {
    this.parameterViewerService
      .getUserAccessDetails()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => (this.dataSourceDetails = res));
  }

  private fetchParameterBfcConfig(
    parameterName: string,
    depot: string,
    busType: string
  ): void {
    this.parameterViewerService
      .getParameterBfcConfig(parameterName, depot, busType)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => (this.dataSourceDetails = res));
  }
}
