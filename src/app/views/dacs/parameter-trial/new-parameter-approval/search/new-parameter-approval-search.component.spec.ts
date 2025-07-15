import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PayloadResponse } from '@app/models/common';
import { IDepoList } from '@app/models/depo';
import {
  INewParameterApproval,
  IParameterMode,
} from '@app/models/parameter-trial';
import { DepoService } from '@app/services/depo.service';
import { FilterService } from '@app/services/filter.service';
import DummyData from '@data/db.json';
import { of } from 'rxjs';
import { NewParameterApprovalSearchComponent } from './new-parameter-approval-search.component';
import { PaginationService } from '@app/services/pagination.service';
import { MessageService } from '@app/services/message.service';
import { CommonService } from '@app/services/common.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('NewParameterApprovalSearchComponent', () => {
  let component: NewParameterApprovalSearchComponent;
  let fixture: ComponentFixture<NewParameterApprovalSearchComponent>;
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
  const mockApprovalList: INewParameterApproval[] =
    DummyData.new_parameter_approval_list;

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
    fixture = TestBed.createComponent(NewParameterApprovalSearchComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(NewParameterApprovalSearchComponent).toBeTruthy();
  });

  it('should open modal', fakeAsync(() => {
    spyOn(component, 'updateView').and.callFake(() => null);

    fixture.detectChanges();
    const button = fixture.debugElement.query(
      val => val.attributes['id'] === 'btnedit'
    );
    expect(button).toBeTruthy();

    button.triggerEventHandler('click', {});
    tick(1000);
    expect(component.updateView).toHaveBeenCalled();
  }));

  it('should handle select all checkboxes', () => {
    const mockEvent = { checked: true } as MatCheckboxChange;
    component.dataSource = mockApprovalList;
    component.checkAllHandler(mockEvent);
    expect(component.chkAll).toBeTrue();
    expect(component.selection.length).toBe(mockApprovalList.length);

    mockEvent.checked = false;
    component.checkAllHandler(mockEvent);
    expect(component.chkAll).toBeFalse();
    expect(component.selection.length).toBe(0);
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
