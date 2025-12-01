import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PayloadResponse } from '@app/models/common';
import { FilterService } from '@app/services/filter.service';
import DummyData from '@data/db.json';
import { IBustList } from '@models/bus-list';
import { IDepoList } from '@models/depo';
import { DepoService } from '@services/depo.service';
import { ManageDailyBusListService } from '@services/manage-daily-bus-list.service';
import { of } from 'rxjs';
import { ViewComponent } from '../view/view.component';
import { BusSearchComponent } from './bus-search.component';
import { PaginationService } from '@app/services/pagination.service';

describe('BusSearchComponent', () => {
  let component: BusSearchComponent;
  let fixture: ComponentFixture<BusSearchComponent>;
  let mockManageDailyBusListService: jasmine.SpyObj<ManageDailyBusListService>;
  let mockDepoService: jasmine.SpyObj<DepoService>;
  let mockFilterService: jasmine.SpyObj<FilterService>;
  let mockPaginationService: jasmine.SpyObj<PaginationService>;

  const mockDepots: IDepoList[] = DummyData.depot_list;

  const mockBusList: IBustList[] = DummyData.daily_bus_list;

  const mockPayloadResponse: PayloadResponse = {
    status: 200,
    status_code: 'SUCCESS',
    timestamp: Date.now(),
    message: 'Dummy data fetched successfully',
    payload: { daily_bus_list: mockBusList },
  };

  const mockDialogRef = {
    afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of(true)),
  };

  const mockDialog = {
    open: jasmine.createSpy('open').and.returnValue(mockDialogRef),
  };

  beforeEach(waitForAsync(() => {
    mockManageDailyBusListService = jasmine.createSpyObj(
      'ManageDailyBusListService',
      ['search']
    );
    mockDepoService = jasmine.createSpyObj('DepoService', ['depoList$']);
    mockFilterService = jasmine.createSpyObj('FilterService', [
      'getSelectedFilters',
      'updateFormGroup',
      'clearSelectedFilters',
    ]);
    mockPaginationService = jasmine.createSpyObj('PaginationService', [
      'paginatedData$',
      'loadData',
      'paginateData',
      'getTotalPages',
      'clearPagination',
      'handlePageEvent',
    ]);

    mockDepoService.depoList$ = of(mockDepots);
    mockFilterService.searchValue$ = of('test');
    mockFilterService.filterValues$ = of({ test: ['1'] });
    mockManageDailyBusListService.search.and.returnValue(
      of(mockPayloadResponse)
    );

    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      providers: [
        {
          provide: ManageDailyBusListService,
          useValue: mockManageDailyBusListService,
        },
        { provide: DepoService, useValue: mockDepoService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: FilterService, useValue: mockFilterService },
        { provide: PaginationService, useValue: mockPaginationService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load depots and call reloadHandler on initialization', () => {
    spyOn(component, 'reloadHandler').and.callThrough();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.depots).toEqual(mockDepots);
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

    expect(component.dataSource.length).toBe(mockBusList.length);
    expect(component.dataSource[0].id).toBe(mockBusList[0].id);
  });

  // it('should handle tab change and call reloadHandler', () => {
  //   spyOn(component, 'reloadHandler').and.callThrough();

  //   component.onTabChange();
  //   fixture.detectChanges();

  //   expect(mockFilterService.clearSelectedFilters).toHaveBeenCalled();
  //   expect(component.reloadHandler).toHaveBeenCalled();
  // });

  it('should handle checkbox selection', () => {
    const mockEvent = { checked: true } as MatCheckboxChange;
    component.dataSource = mockBusList;

    component.checkHandler(mockEvent, mockBusList[0]);
    expect(component.selection.length).toBe(1);
    expect(component.selection[0]).toEqual(mockBusList[0]);

    mockEvent.checked = false;
    component.checkHandler(mockEvent, mockBusList[0]);
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

  it('should handle check all action', () => {
    const mockEvent = { checked: true } as MatCheckboxChange;
    component.dataSource = mockBusList;

    component.checkAllHandler(mockEvent);
    expect(component.selection.length).toBe(mockBusList.length);
    expect(component.chkAll).toBeTrue();
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
