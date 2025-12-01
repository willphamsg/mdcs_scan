import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ParameterViewerService } from './parameter-viewer.service';
import { environment } from '@env/environment';
import DummyData from '@data/db.json';
import { MessageService } from './message.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ParameterViewerService', () => {
  let service: ParameterViewerService;
  let httpMock: HttpTestingController;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        ParameterViewerService,
        { provide: MessageService, useValue: mockMessageService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});

    service = TestBed.inject(ParameterViewerService);
    httpMock = TestBed.inject(HttpTestingController);

    environment.useDummyData = true;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should return dummy system parameters items when useDummyData is true', () => {
    const type = 'DAGW';
    const expectedData = DummyData.parameter_device_dagw_items;

    service.getSystemParametersItems(type).subscribe(data => {
      expect(data).toEqual(expectedData);
    });
  });

  it('should return dummy depot data when useDummyData is true', () => {
    const expectedData = DummyData.parameter_viewer_depot_data;

    service.getSelectedDepotData('').subscribe(data => {
      expect(data).toEqual(expectedData);
    });
  });

  it('should return dummy bus list data when useDummyData is true', () => {
    const expectedData = DummyData.daily_bus_list;

    service.getBusList('').subscribe(data => {
      expect(data).toEqual(expectedData);
    });
  });

  it('should get bus list when useDummyData is false', () => {
    const expectedData = DummyData.daily_bus_list;
    environment.useDummyData = false;

    service.getBusList('').subscribe(data => {
      expect(data).toEqual(expectedData);
    });

    const req = httpMock.expectOne('');
    expect(req.request.method).toBe('GET');
    req.flush(expectedData);
  });

  it('should return getParameter list data when useDummyData is true', () => {
    const expectedData = DummyData.parameter_list;

    service.getParameterList('').subscribe(data => {
      expect(data).toEqual(expectedData);
    });
  });

  it('should get parameter list when useDummyData is false', () => {
    const expectedData = DummyData.parameter_list;
    environment.useDummyData = false;

    service.getParameterList('').subscribe(data => {
      expect(data).toEqual(expectedData);
    });

    const req = httpMock.expectOne('');
    expect(req.request.method).toBe('GET');
    req.flush(expectedData);
  });

  it('should return dummy bus cash fare details when useDummyData is true', () => {
    const expectedData = DummyData.parameter_bus_cash_fare;

    service.getBusCashFareDetails('', '').subscribe(data => {
      expect(data).toEqual(expectedData);
    });
  });

  it('should return bus cash fare details when useDummyData is false', () => {
    environment.useDummyData = false;
    const expectedData = DummyData.parameter_bus_cash_fare;

    service.getBusCashFareDetails('', '').subscribe(data => {
      expect(data).toEqual(expectedData);
    });

    const req = httpMock.expectOne('');
    expect(req.request.method).toBe('GET');
    req.flush(expectedData);
  });

  it('should use HTTP client when useDummyData is false for getUserAccessDetails', () => {
    environment.useDummyData = false;

    service.getUserAccessDetails().subscribe(data => {
      expect(data).toBeTruthy();
    });

    const req = httpMock.expectOne('');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
