import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FilterService } from '@app/services/filter.service';
import DummyData from '@data/db.json';
import { PayloadResponse } from '@models/common';
import { IDepoList } from '@models/depo';
import { IVehicleList } from '@models/vehicle-list';
import { DepoService } from '@services/depo.service';
import { MasterService } from '@services/master.service';
import { MessageService } from '@services/message.service';
import { of } from 'rxjs';
import { ViewComponent } from '../view/view.component';
import { VehicleSearchComponent } from './vehicle-search.component';
import { PaginationService } from '@app/services/pagination.service';

describe('VehicleSearchComponent', () => {
  let component: VehicleSearchComponent;
  let fixture: ComponentFixture<VehicleSearchComponent>;
  let mockDepoService: jasmine.SpyObj<DepoService>;
  let mockFilterService: jasmine.SpyObj<FilterService>;
  let mockMasterService: jasmine.SpyObj<MasterService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockPaginationService: jasmine.SpyObj<PaginationService>;

  const mockDepots: IDepoList[] = DummyData.depot_list;

  const mockVehicleList: IVehicleList[] = DummyData.master_bus_list.map(
    data => ({ ...data, depot_name: 'test' })
  );

  const mockPayloadResponse: PayloadResponse = {
    status: 200,
    status_code: 'SUCCESS',
    timestamp: Date.now(),
    message: 'Dummy data fetched successfully',
    payload: { master_bus_list: mockVehicleList },
  };

  const mockDialogRef = {
    afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of(true)),
  };

  const mockDialog = {
    open: jasmine.createSpy('open').and.returnValue(mockDialogRef),
  };

  mockPaginationService = jasmine.createSpyObj('PaginationService', [
    'loadData',
    'paginateData',
    'getTotalPages',
    'clearPagination',
    'handlePageEvent',
  ]);

  beforeEach(waitForAsync(() => {
    mockDepoService = jasmine.createSpyObj('DepoService', ['depoList$']);
    mockFilterService = jasmine.createSpyObj('FilterService', [
      'getSelectedFilters',
      'updateFormGroup',
      'clearSelectedFilters',
    ]);
    mockMasterService = jasmine.createSpyObj('MasterService', [
      'search',
      'delete',
    ]);
    mockMessageService = jasmine.createSpyObj('MessageService', [
      'warning',
      'confirmation',
    ]);

    mockDepoService.depoList$ = of(mockDepots);
    mockFilterService.searchValue$ = of('test');
    mockFilterService.filterValues$ = of({ test: ['1'] });

    mockMasterService.search.and.returnValue(of(mockPayloadResponse));

    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      providers: [
        { provide: DepoService, useValue: mockDepoService },
        { provide: PaginationService, useValue: mockPaginationService },
        { provide: FilterService, useValue: mockFilterService },
        { provide: MasterService, useValue: mockMasterService },
        { provide: MessageService, useValue: mockMessageService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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

    expect(component.dataSource.length).toBe(mockVehicleList.length);
    expect(component.dataSource[0].id).toBe(mockVehicleList[0].id);
  });

  it('should handle tab change and call reloadHandler', () => {
    spyOn(component, 'reloadHandler').and.callThrough();

    component.onTabChange();
    fixture.detectChanges();

    expect(mockFilterService.clearSelectedFilters).toHaveBeenCalled();
    expect(component.reloadHandler).toHaveBeenCalled();
  });

  it('should handle checkbox selection', () => {
    const mockEvent = { checked: true } as MatCheckboxChange;
    component.dataSource = mockVehicleList;

    component.checkHandler(mockEvent, mockVehicleList[0]);
    expect(component.selection.length).toBe(1);
    expect(component.selection[0]).toEqual(mockVehicleList[0]);

    mockEvent.checked = false;
    component.checkHandler(mockEvent, mockVehicleList[0]);
    expect(component.selection.length).toBe(0);
  });

  it('should open view dialog and call reloadHandler after closing', () => {
    spyOn(component, 'reloadHandler').and.callThrough();
    component.openView();

    expect(mockDialog.open).toHaveBeenCalledWith(
      ViewComponent,
      jasmine.any(Object)
    );
    expect(mockDialogRef.afterClosed).toHaveBeenCalled();
    expect(component.reloadHandler).toHaveBeenCalled();
  });

  it('should open update view dialog and call reloadHandler after closing', () => {
    spyOn(component, 'reloadHandler').and.callThrough();
    component.updateView('update');

    expect(mockDialog.open).toHaveBeenCalledWith(
      ViewComponent,
      jasmine.any(Object)
    );
    expect(mockDialogRef.afterClosed).toHaveBeenCalled();
    expect(component.reloadHandler).toHaveBeenCalled();
  });

  it('should handle check all action', () => {
    const mockEvent = { checked: true } as MatCheckboxChange;
    component.dataSource = mockVehicleList;

    component.checkAllHandler(mockEvent);
    expect(component.selection.length).toBe(mockVehicleList.length);
    expect(component.chkAll).toBeTrue();

    mockEvent.checked = false;
    component.checkAllHandler(mockEvent);
    expect(component.selection.length).toBe(0);
    expect(component.chkAll).toBeFalse();
  });

  it('should call pagination service on page change', () => {
    component.onPageChange({ page: 1, pageSize: 10 });

    expect(mockPaginationService.handlePageEvent).toHaveBeenCalled();
    expect(component.params.page_index).toBe(0);
    expect(component.params.page_size).toBe(10);
  });

  it('should unsubscribe from observables', () => {
    spyOn(component['destroy$'], 'next').and.callThrough();
    spyOn(component['destroy$'], 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
