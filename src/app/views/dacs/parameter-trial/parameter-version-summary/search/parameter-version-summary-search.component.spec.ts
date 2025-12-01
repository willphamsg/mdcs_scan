import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ParameterVersionSummarySearchComponent } from './parameter-version-summary-search.component';
import { ParameterVersionSummaryService } from '@services/parameter-version-summary.service';
import { DepoService } from '@services/depo.service';
import { IParameterVersionSummary } from '@models/parameter-trial';
import { IDepoList } from '@models/depo';
import { PayloadResponse } from '@models/common';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { IFilterConfig } from '@app/shared/utils/form-utils';
import { Sort } from '@angular/material/sort';
import DummyData from '@data/db.json';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ParameterVersionSummarySearchComponent', () => {
  let component: ParameterVersionSummarySearchComponent;
  let fixture: ComponentFixture<ParameterVersionSummarySearchComponent>;
  let mockParameterVersionSummaryService: jasmine.SpyObj<ParameterVersionSummaryService>;
  let mockDepoService: jasmine.SpyObj<DepoService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  const mockDepots: IDepoList[] = DummyData.depot_list;

  const mockParameterVersionSummary: IParameterVersionSummary[] =
    DummyData.parameter_version_summary_list;

  const mockPayloadResponse: PayloadResponse = {
    status: 200,
    status_code: 'SUCCESS',
    timestamp: Date.now(),
    message: 'Dummy data fetched successfully',
    payload: { parameter_version_summary_list: mockParameterVersionSummary },
  };

  beforeEach(waitForAsync(() => {
    mockParameterVersionSummaryService = jasmine.createSpyObj(
      'ParameterVersionSummaryService',
      ['search']
    );
    mockDepoService = jasmine.createSpyObj('DepoService', [
      'depo$',
      'depoList$',
    ]);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    mockParameterVersionSummaryService.search.and.returnValue(
      of(mockPayloadResponse)
    );
    mockDepoService.depoList$ = of(mockDepots);

    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      providers: [
        {
          provide: ParameterVersionSummaryService,
          useValue: mockParameterVersionSummaryService,
        },
        { provide: DepoService, useValue: mockDepoService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterVersionSummarySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call subscribeToDepoChanges', () => {
    spyOn(component, 'subscribeToDepoChanges').and.callThrough();
    component.ngOnInit();
    expect(component.subscribeToDepoChanges).toHaveBeenCalled();
  });

  it('should load depots and set filterConfigs', () => {
    component.ngOnInit();
    expect(component.filterConfigs.length).toBe(1);
    expect(component.filterConfigs[0].controlName).toBe('depots');
    expect(component.filterConfigs[0].options).toEqual(mockDepots);
  });

  it('should fetch parameter version summary list on reloadHandler', () => {
    component.reloadHandler();

    expect(mockParameterVersionSummaryService.search).toHaveBeenCalledWith(
      component.params
    );
    expect(component.dataSource.length).toBe(
      mockParameterVersionSummary.length
    );
  });

  it('should load filter values with depot list', () => {
    component.loadFilterValues();
    expect(component.filterConfigs.length).toBe(1);
    const filterConfig: IFilterConfig = component.filterConfigs[0];
    expect(filterConfig.controlName).toBe('depots');
    expect(filterConfig.options).toEqual(mockDepots);
  });

  it('should unsubscribe from observables', () => {
    spyOn(component['destroy$'], 'next').and.callThrough();
    spyOn(component['destroy$'], 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
