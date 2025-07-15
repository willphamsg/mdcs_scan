import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FilterService } from '@app/services/filter.service';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import { of } from 'rxjs';
import { SelectedFilterComponent } from './selected-filter.component';

describe('SelectedFilterComponent', () => {
  let component: SelectedFilterComponent;
  let fixture: ComponentFixture<SelectedFilterComponent>;
  let mockFilterService: jasmine.SpyObj<FilterService>;

  const mockFilterConfigs: IFilterConfig[] = [
    {
      controlName: 'depot',
      type: 'select',
      value: '',
      options: [{ id: '1', value: '' }],
    },
    {
      controlName: 'effectiveDate',
      type: 'date-range',
      value: '',
      children: [],
    },
  ];

  const mockSelectedFilters = {
    depot: 'test',
  };

  mockFilterService = jasmine.createSpyObj('FilterService', [
    'selectedFilters$',
    'filterConfigs$',
    'clearSelectedFilters',
    'removeFilter',
    'getSelectedFilters',
    'updateFilterValues',
  ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      providers: [{ provide: FilterService, useValue: mockFilterService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedFilterComponent);
    component = fixture.componentInstance;

    mockFilterService.selectedFilters$ = of(mockSelectedFilters);
    mockFilterService.filterConfigs$ = of(mockFilterConfigs);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and set filter values on ngOnInit', () => {
    component.ngOnInit();
    expect(component.selectedFilters).toBeDefined();
    expect(component.filterConfigs).toBeDefined();
  });

  it('should clear selected filters on ngOnDestroy', () => {
    component.ngOnDestroy();
    expect(mockFilterService.clearSelectedFilters).toHaveBeenCalled();
  });

  it('should check if a filter is not empty', done => {
    component.isFilterNotEmpty('depot').subscribe(res => {
      expect(res).toBeTrue();
      done();
    });
  });

  it('should check if a filter is a valid date range', done => {
    mockFilterService.selectedFilters$ = of({
      effectiveDate: {
        startDate: '12-12-2024',
        endDate: '12-12-2024',
      },
    });

    component.isDateRangeFilter('effectiveDate').subscribe(isDateRange => {
      expect(isDateRange).toBeTrue();
      done();
    });
  });

  it('should remove a filter', () => {
    mockFilterService.getSelectedFilters.and.returnValue(mockSelectedFilters);

    component.removeFilter('depot');

    expect(mockFilterService.removeFilter).toHaveBeenCalledWith('depot', {
      ...mockSelectedFilters,
      depot: '',
    });
  });

  it('should display selected filters in template', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const chips = fixture.debugElement.queryAll(By.css('.filter-chip'));
    expect(chips.length).toBe(Object.keys(mockSelectedFilters).length);
  });
});
