import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  viewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
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
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { BreadcrumbsComponent } from '@app/components/layout/breadcrumbs/breadcrumbs.component';
import { IBustList } from '@app/models/bus-list';
import { IDepoList } from '@app/models/depo';
import {
  IParameterDepotItems,
  IParameterList,
  IParameterViewerData,
  IParameterViewerItems,
} from '@app/models/parameter-management';
import { LayoutConfigService } from '@app/services/layout-config.service';
import { ParameterViewerService } from '@app/services/parameter-viewer.service';
import {
  IValidatorConfig,
  removeValidator,
  setFormValidators,
} from '@app/shared/utils/form-utils';
import { map, Observable, of, Subject, takeUntil } from 'rxjs';
import { MainLayoutComponent } from './shared/main-layout/main-layout.component';
import { UserTableComponent } from './shared/components/user-table/user-table.component';

@Component({
    selector: 'app-parameter-viewer',
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
        ReactiveFormsModule,
        MainLayoutComponent
    ],
    templateUrl: './parameter-viewer.component.html',
    styleUrls: ['./parameter-viewer.component.scss']
})
export class ParameterViewerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  accordion = viewChild.required(MatAccordion);

  parameterDeviceItems$: Observable<IParameterViewerItems[]> = of([]);
  parameterList$: Observable<IParameterList[]> = of([]);
  busList$: Observable<IBustList[]> = of([]);
  depots$: Observable<IDepoList[]> = of([]);

  tabIdx = 0;
  tabList = [
    { label: 'MDCS', id: 1, tab_code: 'MDCS' },
    { label: 'DAGW', id: 2, tab_code: 'DAGW' },
    { label: 'Bus Device', id: 3, tab_code: 'BD' },
    { label: 'Inspection Device', id: 4, tab_code: 'ID' },
  ];

  sideNavHeader = 'MDCS';
  displayedColumns: string[] = [
    'fileId',
    'parameterName',
    'parameterVersion',
    'formatVersion',
    'effectiveDateTime',
  ];

  dataSource: IParameterViewerData | null = null;
  dataSourceDetails: any[] = [];
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
    private cdr: ChangeDetectorRef,
    private layoutConfigService: LayoutConfigService
  ) {}

  ngOnInit(): void {
    this.setActiveTab();
    this.loadParameterItems(this.sideNavHeader);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.accordion().closeAll();
    this.cdr.detectChanges();
    this.selectedItem = '';

    const selectedTab = this.tabList.find(
      tab => tab.label === event.tab.textLabel
    );
    if (selectedTab) {
      this.sideNavHeader = selectedTab.label;

      this.loadParameterItems(selectedTab.tab_code);
    }
  }

  loadParameterItems(tabCode: string): void {
    this.parameterDeviceItems$ =
      this.parameterViewerService.getSystemParametersItems(tabCode);
  }

  setDepotList(item: string): void {
    this.depots$ = this.parameterViewerService
      .getDepotData(item)
      .pipe(map((data: IParameterDepotItems) => data?.items));
  }

  setActiveTab(): void {
    this.tabIdx = this.tabList.findIndex(
      idx => idx.tab_code === this.sideNavHeader
    );
  }

  onSelectItem(device: IParameterViewerItems, deviceCode: string): void {
    console.log('Selected Device:', device, deviceCode);
    this.resetForm();
    this.layoutConfigService.reset();
    this.selectedItem = deviceCode;
    this.selectedDevice = device.device_type;

    this.dataSource = null;
    this.dataSourceDetails = [];

    this.layoutConfigService.setLayoutConfig(deviceCode);

    this.setDepotList(deviceCode);
    this.parameterList$ =
      this.parameterViewerService.getParameterList(deviceCode);

    this.configureFormForDevice(deviceCode, device.device_type);

    this.subscribeToFormChanges(deviceCode, device.device_type);
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
      .subscribe(() => {
        this.dataSource = null;

        const requiredFields = this.getRequiredFieldsForDeviceType(
          deviceCode,
          deviceType
        );

        const allRequiredFieldsValid = requiredFields.every(
          field => this.deviceConfigFormGroup.get(field)?.valid
        );
        // console.log({ allRequiredFieldsValid });

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
