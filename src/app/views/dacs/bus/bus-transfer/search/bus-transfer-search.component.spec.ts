import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IBusTransferList } from '@app/models/bus-transfer';
import { PayloadResponse } from '@app/models/common';
import { IDepoList } from '@app/models/depo';
import { CommonService } from '@app/services/common.service';
import { DepoService } from '@app/services/depo.service';
import { FilterService } from '@app/services/filter.service';
import { MessageService } from '@app/services/message.service';
import { PaginationService } from '@app/services/pagination.service';
import { initialState } from '@app/store/bus.reducer';
import DummyData from '@data/db.json';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { BusTransferSearchComponent } from './bus-transfer-search.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('BusTransferSearchComponent', () => {
  let component: BusTransferSearchComponent;
  let fixture: ComponentFixture<BusTransferSearchComponent>;
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

  const mockBusTransferList: IBusTransferList[] =
    DummyData.bus_transfer_list.map(data => ({
      ...data,
      depot: 'test',
      chk: false,
      current_depot_name: 'test',
      current_operator_name: 'test',
      current_depot: 'test',
      future_depot_name: 'test',
      future_operator_name: 'test',
      future_depot: 'test',
      future_operator: 'test',
      target_effective_date: 'test',
      target_effective_time: 'test',
    }));

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
    imports: [BrowserAnimationsModule],
    providers: [
        { provide: DepoService, useValue: mockDepoService },
        { provide: PaginationService, useValue: mockPaginationService },
        { provide: FilterService, useValue: filterServiceSpy },
        { provide: CommonService, useValue: mockCommonService },
        { provide: MessageService, useValue: mockMessageService },
        provideMockStore({ initialState }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusTransferSearchComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(BusTransferSearchComponent).toBeTruthy();
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

  it('should handle check all action', () => {
    const mockEvent = { checked: true } as MatCheckboxChange;
    component.dataSource = mockBusTransferList;

    component.checkAllHandler(mockEvent);
    expect(component.selection.length).toBe(mockBusTransferList.length);
    expect(component.chkAll).toBeTrue();

    mockEvent.checked = false;
    component.checkAllHandler(mockEvent);
    expect(component.selection.length).toBe(0);
    expect(component.chkAll).toBeFalse();
  });

  it('should set filterConfigs in loadFilterValues', () => {
    component.loadFilterValues();

    expect(component.filterConfigs.length).toBe(3);
    expect(component.filterConfigs[0].controlName).toBe('currDepot');
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

// describe('Bus Transfer Service', () => {
//   let service: ManageBusTransferService;
//   let controller: HttpTestingController;
//   const datetime =
//     new DatePipe('en-US').transform(new Date(), 'dd/MM/yyyy HH:mm') ||
//     new Date().toDateString();
//   const time =
//     new DatePipe('en-US').transform(new Date(), 'HH:mm a') ||
//     new Date().toDateString();
//   const param: IBusTransferList[] = [
//     {
//       id: 1,
//       version: 0,
//       bus_num: '1234',
//       bus_id: 'ZQY0103',
//       current_depot: 1,
//       current_operator: '1',
//       current_effective_date: datetime,
//       future_depot: '9',
//       future_operator: '1',
//       target_effective_date: datetime,
//       target_effective_time: time,
//       future_effective_date: datetime,
//       status: 'Pending',
//       chk: false,
//       depot_id: '',
//     },
//   ];

//   beforeEach((): void => {
//     TestBed.configureTestingModule({
//       imports: [HttpClientTestingModule, BusTransferSearchComponent],
//     });
//   });

//   beforeEach((): void => {
//     service = TestBed.inject(ManageBusTransferService);
//     controller = TestBed.inject(HttpTestingController);
//   });

//   it('should create service', (): void => {
//     expect(service).toBeTruthy();
//   });

//   it('should import csv file', () => {
//     const ev = {
//       prevented: false,
//       files: [
//         {
//           uid: '01',
//           name: 'filename',
//           extension: '.csv',
//           size: 123000,
//           rawFile: 'test raw file',
//         },
//       ],
//     };

//     const mockReader = {
//       addEventListener: jasmine.createSpy().and.callFake((event, listener) => {
//         listener();
//       }),
//       readAsDataURL: jasmine.createSpy(),
//     };
//     spyOn(window, 'FileReader').and.returnValue(
//       mockReader as unknown as FileReader
//     );

//     service
//       .import(ev)
//       .pipe(take(1))
//       .subscribe((res: PayloadResponse) => {
//         expect(res.status).toEqual(200);
//       });

//     const request: TestRequest = controller.expectOne({
//       method: 'POST',
//       url: `https://localhost:8045/api/bus-transfer/import`,
//     });

//     request.flush({
//       status: 200,
//       status_code: 'INFO 5020',
//       payload: [],
//     });
//   });

//   it('should search action required', (): void => {
//     const param: BusTransferRequest = {
//       page_size: 5,
//       page_index: 0,
//       sort_order: [],
//       search_text: '',
//       search_select_filter: {
//         status: ['Pending'],
//         current_depot: [],
//         current_operator: [],
//         future_operator: [],
//       },
//     };

//     service
//       .search(param)
//       .pipe(take(1))
//       .subscribe((res: PayloadResponse) => {
//         expect(res.status).toEqual(200);
//       });

//     const request: TestRequest = controller.expectOne({
//       method: 'POST',
//       url: `https://localhost:8045/api/bus-transfer/search`,
//     });

//     request.flush({
//       status: 200,
//       status_code: 'INFO 5020',
//       payload: [],
//     });
//   });

//   it('should search manage records', (): void => {
//     const param: BusTransferRequest = {
//       page_size: 5,
//       page_index: 0,
//       sort_order: [],
//       search_text: '',
//       search_select_filter: {
//         status: ['Approved', 'Rejected'],
//         current_depot: [],
//         current_operator: [],
//         future_operator: [],
//       },
//     };

//     service
//       .search(param)
//       .pipe(take(1))
//       .subscribe((res: PayloadResponse) => {
//         expect(res.status).toEqual(200);
//       });

//     const request: TestRequest = controller.expectOne({
//       method: 'POST',
//       url: `https://localhost:8045/api/bus-transfer/search`,
//     });

//     request.flush({
//       status: 200,
//       status_code: 'INFO 5020',
//       payload: [],
//     });
//   });

//   it('should approved', (): void => {
//     service
//       .approve(param)
//       .pipe(take(1))
//       .subscribe((res: PayloadResponse) => {
//         expect(res.status).toEqual(200);
//       });

//     const request: TestRequest = controller.expectOne({
//       method: 'POST',
//       url: `https://localhost:8045/api/bus-transfer/approved`,
//     });

//     request.flush({
//       status: 200,
//       status_code: 'INFO 5020',
//       payload: [],
//     });
//   });

//   it('should reject', (): void => {
//     service
//       .reject(param)
//       .pipe(take(1))
//       .subscribe((res: PayloadResponse) => {
//         expect(res.status).toEqual(201);
//       });

//     const request: TestRequest = controller.expectOne({
//       method: 'POST',
//       url: `https://localhost:8045/api/bus-transfer/reject`,
//     });

//     request.flush({
//       status: 201,
//       status_code: 'INFO 5020',
//       payload: [],
//     });
//   });

//   it('should update', (): void => {
//     service
//       .update(param)
//       .pipe(take(1))
//       .subscribe((res: PayloadResponse) => {
//         expect(res.status).toEqual(201);
//       });

//     const request: TestRequest = controller.expectOne({
//       method: 'POST',
//       url: `https://localhost:8045/api/bus-transfer/update`,
//     });

//     request.flush({
//       status: 201,
//       status_code: 'INFO 5020',
//       payload: [],
//     });
//   });
// });
