import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TrialDeviceSelectionSearchComponent } from './trial-device-selection-search.component';
import { ParameterService } from '@app/services/parameter.service';
import { DepoService } from '@services/depo.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { IDepoList } from '@models/depo';
import { PayloadResponse } from '@models/common';
import { ITrialDeviceSelection } from '@models/parameter-trial';
import DummyData from '@data/db.json';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { PaginationService } from '@app/services/pagination.service';
import { MessageService } from '@app/services/message.service';
import { CommonService } from '@app/services/common.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FilterService } from '@app/services/filter.service';

describe('TrialDeviceSelectionSearchComponent', () => {
  let component: TrialDeviceSelectionSearchComponent;
  let fixture: ComponentFixture<TrialDeviceSelectionSearchComponent>;
  let mockDepoService: jasmine.SpyObj<DepoService>;
  let mockPaginationService: jasmine.SpyObj<PaginationService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;

  const mockPayloadResponse: PayloadResponse = {
    status: 200,
    status_code: 'SUCCESS',
    timestamp: Date.now(),
    message: 'Dummy data fetched successfully',
    payload: DummyData,
  };

  const mockDepots: IDepoList[] = DummyData.depot_list;

  const filterServiceSpy = jasmine.createSpyObj('FilterService', [
    'getSelectedFilters',
    'updateFormGroup',
    'clearSelectedFilters',
  ]);

  mockDepoService = jasmine.createSpyObj('DepoService', ['depoList$']);
  mockCommonService = jasmine.createSpyObj('CommonService', ['search']);
  mockPaginationService = jasmine.createSpyObj('PaginationService', [
    'loadData',
    'paginateData',
    'getTotalPages',
    'clearPagination',
    'handlePageEvent',
  ]);
  mockMessageService = jasmine.createSpyObj('MessageService', [
    'MessageResponse',
  ]);

  beforeEach(waitForAsync(() => {
    filterServiceSpy.searchValue$ = of('test');
    filterServiceSpy.filterValues$ = of({ test: ['1'] });
    mockDepoService.depoList$ = of(mockDepots);
    mockMessageService.MessageResponse.and.returnValue(true);
    mockCommonService.search.and.returnValue(of(mockPayloadResponse));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, BrowserAnimationsModule],
      providers: [
        { provide: DepoService, useValue: mockDepoService },
        { provide: PaginationService, useValue: mockPaginationService },
        { provide: FilterService, useValue: filterServiceSpy },
        { provide: CommonService, useValue: mockCommonService },
        { provide: MessageService, useValue: mockMessageService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrialDeviceSelectionSearchComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(TrialDeviceSelectionSearchComponent).toBeTruthy();
  });

  it('should set filterConfigs in loadFilterValues', () => {
    component.loadFilterValues();

    expect(component.filterConfigs.length).toBe(1);
    expect(component.filterConfigs[0].controlName).toBe('depots');
    expect(component.filterConfigs[0].options?.length).toBe(mockDepots.length);
  });

  it('should load depots and call reloadHandler on depo change', () => {
    spyOn(component, 'reloadHandler').and.callThrough();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.depots).toEqual(mockDepots);
    expect(component.reloadHandler).toHaveBeenCalled();
  });

  it('should call pagination service on page change', () => {
    component.onPageChange({ page: 1, pageSize: 10 });

    expect(mockPaginationService.handlePageEvent).toHaveBeenCalled();
    expect(component.params.page_index).toBe(0);
    expect(component.params.page_size).toBe(10);
  });

  it('should call clearSelectedFilters on tabChange', () => {
    spyOn(component, 'reloadHandler');
    component.onTabChange();

    expect(filterServiceSpy.clearSelectedFilters).toHaveBeenCalled();
    expect(component.reloadHandler).toHaveBeenCalled();
  });

  it('should unsubscribe from observables', () => {
    spyOn(component['destroy$'], 'next').and.callThrough();
    spyOn(component['destroy$'], 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
