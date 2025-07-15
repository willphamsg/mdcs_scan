import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { IFile } from '@app/models/parameter-management';
import { FileImportExportService } from '@app/services/file-import-export.service';
import { PaginationService } from '@app/services/pagination.service';
import DummyData from '@data/db.json';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { ParameterFileExportComponent } from './parameter-file-export.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DepoService } from '@app/services/depo.service';
import { MessageService } from '@app/services/message.service';
import { CommonService } from '@app/services/common.service';
import { PayloadResponse } from '@app/models/common';
import { IDepoList } from '@app/models/depo';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FilterService } from '@app/services/filter.service';

describe('ParameterFileExportComponent', () => {
  let component: ParameterFileExportComponent;
  let fixture: ComponentFixture<ParameterFileExportComponent>;
  let mockDepoService: jasmine.SpyObj<DepoService>;
  let mockPaginationService: jasmine.SpyObj<PaginationService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockStore: jasmine.SpyObj<Store>;

  const mockPayloadResponse: PayloadResponse = {
    status: 200,
    status_code: 'SUCCESS',
    timestamp: Date.now(),
    message: 'Dummy data fetched successfully',
    payload: DummyData,
  };

  const mockDepots: IDepoList[] = DummyData.depot_list;
  const mockExportList: IFile[] = DummyData.parameter_file_export_data;

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
    mockStore = jasmine.createSpyObj('Store', ['dispatch']);
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
        { provide: Store, useValue: mockStore },
      ],
    }).compileComponents();

    mockStore = TestBed.inject(Store) as jasmine.SpyObj<Store>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterFileExportComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(ParameterFileExportComponent).toBeTruthy();
  });

  it('should handle select all checkboxes', () => {
    const mockEvent = { checked: true } as MatCheckboxChange;
    component.dataSource = mockExportList;
    component.checkAllHandler(mockEvent);
    expect(component.chkAll).toBeTrue();
    expect(component.selection.length).toBe(mockExportList.length);

    mockEvent.checked = false;
    component.checkAllHandler(mockEvent);
    expect(component.chkAll).toBeFalse();
    expect(component.selection.length).toBe(0);
  });

  it('should set filterConfigs in loadFilterValues', () => {
    component.loadFilterValues();

    expect(component.filterConfigs.length).toBe(2);
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

  it('should handle checkbox selection', () => {
    const mockEvent = { checked: true } as MatCheckboxChange;
    component.dataSource = mockExportList;

    component.checkHandler(mockEvent, mockExportList[0]);
    expect(component.selection.length).toBe(1);
    expect(component.selection[0]).toEqual(mockExportList[0]);

    mockEvent.checked = false;
    component.checkHandler(mockEvent, mockExportList[0]);
    expect(component.selection.length).toBe(0);
  });

  it('should unsubscribe from observables', () => {
    spyOn(component['destroy$'], 'next').and.callThrough();
    spyOn(component['destroy$'], 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
