import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FilterComponent } from './filter.component';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';
import { MatMenuTrigger } from '@angular/material/menu';
import { FilterService } from '@app/services/filter.service';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import { distinctUntilChanged, of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;
  let filterService: jasmine.SpyObj<FilterService>;

  const mockFilterConfigs: IFilterConfig[] = [
    {
      controlName: 'depot',
      type: 'select',
      value: '',
      options: [{ id: '1', value: '' }],
    },
    { controlName: 'dateRange', type: 'date-range', value: '', children: [] },
  ];

  beforeEach(waitForAsync(() => {
    const filterServiceSpy = jasmine.createSpyObj('FilterService', [
      'updateSearchValue',
      'updateFormGroup',
      'updateSelectedFilters',
      'updateFilterConfigs',
      'updateFilterValues',
      'updateDateRangeFilter',
      'clearSelectedFilters',
    ]);

    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, ReactiveFormsModule],
      providers: [{ provide: FilterService, useValue: filterServiceSpy }],
    }).compileComponents();

    filterService = TestBed.inject(
      FilterService
    ) as jasmine.SpyObj<FilterService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;

    component.filterConfigs = mockFilterConfigs;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form on changes', () => {
    const initializeFormSpy = spyOn(component as any, 'initializeForm');
    component.ngOnChanges({
      filterConfigs: {
        currentValue: mockFilterConfigs,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    expect(initializeFormSpy).toHaveBeenCalled();
  });

  it('should initialize form with filterConfigs on init', () => {
    const initializeFormSpy = spyOn(component, 'initializeForm');
    component.ngOnInit();
    expect(initializeFormSpy).toHaveBeenCalled();
  });

  it('should apply filters and call FilterService methods', () => {
    const updateSelectedFiltersSpy = filterService.updateSelectedFilters;
    const updateFilterConfigsSpy = filterService.updateFilterConfigs;
    const updateFormGroupSpy = filterService.updateFormGroup;

    component.applyFilter();

    expect(updateSelectedFiltersSpy).toHaveBeenCalled();
    expect(updateFilterConfigsSpy).toHaveBeenCalledWith(mockFilterConfigs);
    expect(updateFormGroupSpy).toHaveBeenCalled();
  });

  it('should clear filter and reset the form', () => {
    const updateFormGroupSpy = filterService.updateFormGroup;

    component.clearFilter();

    expect(updateFormGroupSpy).toHaveBeenCalled();
    expect(component.filterForm.pristine).toBeTrue();
  });

  it('should update search value on search control change', () => {
    const searchTerm = 'test';
    filterService.updateSearchValue(searchTerm);

    component.searchControl.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(value => {
        expect(value).toEqual(searchTerm);
      });
  });

  it('should call FilterService methods to get applied filters', () => {
    component.filterForm = new FormGroup({
      depot: new FormControl('Depot 1'),
      dateRange: new FormControl({
        startDate: new Date(),
        endDate: new Date(),
      }),
    });

    const appliedFilters = component.getAppliedFilters();

    expect(appliedFilters).toBeDefined();
    expect(appliedFilters['depot']).toEqual('Depot 1');
  });

  it('should get options for a config key', () => {
    const options = component['getConfigOptions']('depot');
    expect(options).toEqual([{ id: '1', value: '' }]);
  });

  it('should get type for a config key', () => {
    const type = component['getConfigType']('depot');
    expect(type).toEqual('select');
  });
});
