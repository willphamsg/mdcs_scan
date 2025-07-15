import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TFilter } from '@app/models/common';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import { BehaviorSubject } from 'rxjs';

// TODO: Refactor this service. This can still be optimized
@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private selectedFilters = new BehaviorSubject<{
    [key: string]: TFilter;
  }>({});
  selectedFilters$ = this.selectedFilters.asObservable();

  private filterConfigsSubject = new BehaviorSubject<IFilterConfig[]>([]);
  filterConfigs$ = this.filterConfigsSubject.asObservable();

  private formGroupSubject = new BehaviorSubject<FormGroup | null>(null);

  private searchValueSubject = new BehaviorSubject<string | null>('');
  searchValue$ = this.searchValueSubject.asObservable();

  private filterValuesSubject = new BehaviorSubject<{
    [key: string]: TFilter;
  }>({});
  filterValues$ = this.filterValuesSubject.asObservable();

  updateFilterValues(value: { [key: string]: string[] }): void {
    const currFilter = this.filterValuesSubject.getValue();
    const updatedValues = {
      ...currFilter,
      ...value,
    };

    this.filterValuesSubject.next(updatedValues);
  }

  updateSearchValue(value: string | null): void {
    this.searchValueSubject.next(value);
  }

  get formGroup$() {
    return this.formGroupSubject.asObservable();
  }

  getSelectedFilters() {
    return this.selectedFilters.getValue();
  }

  updateFormGroup(form: any): void {
    this.formGroupSubject.next(form);
  }

  updateSelectedFilters(value: { [key: string]: string }): void {
    this.selectedFilters.next(value);
  }

  updateFilterConfigs(newConfig: IFilterConfig[]) {
    this.filterConfigsSubject.next(newConfig);
  }

  removeFilter(
    filterKey: string,
    updatedFilters: {
      [key: string]: TFilter;
    }
  ): void {
    this.selectedFilters.next(updatedFilters);
    this.filterValuesSubject.next({});

    const formGroup = this.formGroupSubject.getValue();

    if (formGroup) {
      const control = formGroup.get(filterKey);
      if (control) {
        control.reset();
      }
    }
  }

  clearSelectedFilters(): void {
    const updatedFilters = { ...this.getSelectedFilters() };

    Object.keys(this.getSelectedFilters()).forEach(filterKey => {
      updatedFilters[filterKey] = '';

      this.removeFilter(filterKey, updatedFilters);
    });
  }

  updateDateRangeFilter(
    controlName: string,
    dateRange: {
      startDate: Date | null;
      endDate: Date | null;
    }
  ): void {
    const startDateString = dateRange.startDate
      ? dateRange.startDate.toISOString()
      : '';
    const endDateString = dateRange.endDate
      ? dateRange.endDate.toISOString()
      : '';

    const dateRangeFilter = {
      [controlName]: [startDateString, endDateString].filter(date => date),
    };

    this.updateFilterValues(dateRangeFilter);
  }
}
