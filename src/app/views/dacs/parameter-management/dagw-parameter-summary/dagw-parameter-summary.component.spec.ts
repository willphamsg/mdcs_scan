import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PayloadResponse } from '@app/models/common';
import { IDepoList } from '@app/models/depo';
import { IDagwParameterSummary } from '@app/models/parameter-management';
import { DagwParameterSummaryService } from '@app/services/dagw-parameter-summary.service';
import { DepoService } from '@app/services/depo.service';
import { FilterService } from '@app/services/filter.service';
import { PaginationService } from '@app/services/pagination.service';
import DummyData from '@data/db.json';
import { of } from 'rxjs';
import { DagwParameterSummaryComponent } from './dagw-parameter-summary.component';

describe('DagwParameterSummaryComponent', () => {
  let component: DagwParameterSummaryComponent;
  let fixture: ComponentFixture<DagwParameterSummaryComponent>;

  let mockDagwParameterSummaryService: jasmine.SpyObj<DagwParameterSummaryService>;
  let mockPaginationService: jasmine.SpyObj<PaginationService>;
  let mockFilterService: jasmine.SpyObj<FilterService>;
  let mockDepoService: jasmine.SpyObj<DepoService>;

  const mockDepots: IDepoList[] = DummyData.depot_list;

  const mockDagwList: IDagwParameterSummary[] =
    DummyData.dagw_parameter_summary;

  const mockPayloadResponse: PayloadResponse = {
    status: 200,
    status_code: 'SUCCESS',
    timestamp: Date.now(),
    message: 'Dummy data fetched successfully',
    payload: { dagw_parameter_summary: mockDagwList },
  };

  beforeEach(waitForAsync(() => {
    mockDagwParameterSummaryService = jasmine.createSpyObj(
      'DagwParameterSummaryService',
      ['search']
    );
    mockPaginationService = jasmine.createSpyObj('PaginationService', [
      'paginatedData$',
      'loadData',
      'paginateData',
      'getTotalPages',
      'clearPagination',
    ]);
    mockFilterService = jasmine.createSpyObj('FilterService', [
      'getSelectedFilters',
      'updateFormGroup',
      'clearSelectedFilters',
    ]);

    mockDepoService = jasmine.createSpyObj('DepoService', ['depoList$']);

    mockDepoService.depoList$ = of(mockDepots);
    mockFilterService.searchValue$ = of('test');
    mockFilterService.filterValues$ = of({ test: ['1'] });

    mockDagwParameterSummaryService.search.and.returnValue(
      of(mockPayloadResponse)
    );

    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      providers: [
        { provide: DepoService, useValue: mockDepoService },
        {
          provide: DagwParameterSummaryService,
          useValue: mockDagwParameterSummaryService,
        },
        { provide: PaginationService, useValue: mockPaginationService },
        { provide: FilterService, useValue: mockFilterService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DagwParameterSummaryComponent);
    component = fixture.componentInstance;

    mockFilterService.getSelectedFilters.and.returnValue({});

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load depots and set search_text on initialization', () => {
    spyOn(component, 'reloadHandler').and.callThrough();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.depots).toEqual(mockDepots);
    expect(component.params.search_text).toBe('test');
    expect(component.reloadHandler).toHaveBeenCalled();
  });

  it('should load filter values', () => {
    component.loadFilterValues();
    fixture.detectChanges();

    expect(component.filterConfigs.length).toBe(4);
    expect(component.filterConfigs[0].controlName).toBe('depots');
    expect(component.filterConfigs[0].options).toEqual(mockDepots);
  });

  it('should update dataSource after calling reloadHandler', () => {
    component.reloadHandler();
    fixture.detectChanges();

    expect(component.dataSource.length).toBe(mockDagwList.length);
    expect(component.dataSource[0].id).toBe(mockDagwList[0].id);
  });

  it('should unsubscribe from observables', () => {
    spyOn(component['destroy$'], 'next').and.callThrough();
    spyOn(component['destroy$'], 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
