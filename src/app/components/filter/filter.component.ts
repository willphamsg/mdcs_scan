import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  viewChild,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDivider } from '@angular/material/divider';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { FilterService } from '@app/services/filter.service';
import { MatRadioModule } from '@angular/material/radio';
import { CONTROL_NAME_LABELS } from '@app/shared/utils/constants';
import {
  createFormGroup,
  getDateRangeValue,
  getSelectedDepotValues,
  getSelectedValuesFromFormArray,
  IFilterConfig,
  isDateRangeControl,
} from '@app/shared/utils/form-utils';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';

@Component({
    selector: 'app-filter',
    imports: [
        MatFormFieldModule,
        MatButtonModule,
        MatRadioModule,
        MatIconModule,
        MatExpansionModule,
        MatMenuModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCheckboxModule,
        MatInputModule,
        MatSelectModule,
        MatDivider,
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
    ],
    templateUrl: './filter.component.html',
    styleUrl: './filter.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;
  accordion = viewChild.required(MatAccordion);

  @Input() enableSearch: boolean = true;
  @Input() disableFilter: boolean = false;
  @Input() filterConfigs: IFilterConfig[] = [];
  @Input() placeholder: string = 'Search by keyword';

  filterForm: FormGroup;
  searchControl = new FormControl('');

  FILTER_NAMES: { [key: string]: string } = CONTROL_NAME_LABELS;

  // TODO: Filter Component can still be optimized, still temporary. Need the final logic
  constructor(
    private cdr: ChangeDetectorRef,
    private filterService: FilterService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['filterConfigs'] &&
      changes['filterConfigs'].currentValue !==
        changes['filterConfigs'].previousValue
    ) {
      this.initializeForm();
    }
  }

  ngOnInit(): void {
    this.initializeForm();

    this.searchControl.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(value => {
        // if (value)
        this.filterService.updateSearchValue(value);
      });
  }

  ngOnDestroy(): void {
    this.cdr.detach();

    if (this.filterForm) {
      this.filterForm.reset();
    }
  }

  initializeForm(): void {
    this.filterForm = createFormGroup(this.filterConfigs);
    this.filterService.updateFormGroup(this.filterForm);
  }

  applyFilter() {
    this.accordion().closeAll();
    this.cdr.detectChanges();

    this.filterService.updateSelectedFilters(this.getAppliedFilters());
    this.filterService.updateFilterConfigs(this.filterConfigs);

    this.filterService.updateFormGroup(this.filterForm);
    this.menuTrigger.closeMenu();
  }

  getAppliedFilters(): { [key: string]: string } {
    const filters: any = {};

    this.filterConfigs.forEach(({ controlName }) => {
      const control = this.filterForm.get(controlName);
      if (!control || !control.value || control.value == null) return;

      const configType = this.getConfigType(controlName);
      const configOptions = this.getConfigOptions(controlName);

      if (
        controlName.toLowerCase().includes('depot') &&
        configType !== 'select'
      ) {
        const depotData = getSelectedDepotValues(
          this.filterForm,
          controlName,
          'depot_name',
          configOptions
        );
        filters[controlName] = depotData.selectedValues;

        if (depotData.selectedIds && depotData.selectedIds.length > 0) {
          const mapDepotIds = {
            [controlName]: depotData.selectedIds,
          };
          this.filterService.updateFilterValues(mapDepotIds);
        }
      } else if (
        control instanceof FormArray &&
        !controlName.toLowerCase().includes('depot')
      ) {
        const formArrayValue = getSelectedValuesFromFormArray(
          this.filterForm,
          controlName,
          configOptions
        );
        filters[controlName] = formArrayValue.selectedValues;

        if (
          formArrayValue.selectedIds &&
          formArrayValue.selectedIds.length > 0
        ) {
          const mapArrayIds = {
            [controlName]: formArrayValue.selectedIds,
          };

          // console.log({ mapArrayIds });
          this.filterService.updateFilterValues(mapArrayIds);
        }
      } else if (isDateRangeControl(control)) {
        const dateRangeValue = getDateRangeValue(control);

        if (dateRangeValue.startDate || dateRangeValue.endDate) {
          filters[controlName] = dateRangeValue;
          this.filterService.updateDateRangeFilter(controlName, dateRangeValue);
        }
      } else {
        const controlValue = control.value || null;

        if (controlValue) {
          filters[controlName] = controlValue;
          this.filterService.updateFilterValues({
            [controlName]: [controlValue],
          });
        }
      }
    });

    return filters;
  }

  private getConfigOptions(controlKey: string): any[] {
    const control = this.filterConfigs.find(
      config => config.controlName === controlKey
    );
    return control && control.options ? control.options : [];
  }

  private getConfigType(controlKey: string): string {
    const control = this.filterConfigs.find(
      config => config.controlName === controlKey
    );

    return control && control.type ? control.type : '';
  }

  clearFilter() {
    this.filterService.clearSelectedFilters();
    this.accordion().closeAll();
    this.cdr.detectChanges();

    this.menuTrigger.closeMenu();
  }
}
