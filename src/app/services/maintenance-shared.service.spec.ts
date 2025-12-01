import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MaintenanceSharedService } from './maintenance-shared.service';
import { environment } from '@env/environment';
import DummyData from '@data/db.json';
import { IDepoList } from '@app/models/depo';
import {
  IStatusCategory,
  IEodProcess,
  IAudtitLog,
  ISystemInfo,
  IUpdateType,
} from '@app/models/maitenance';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('MaintenanceSharedService', () => {
  let service: MaintenanceSharedService;
  let httpMock: HttpTestingController;

  const mockDepot: IDepoList = DummyData.depot_list[0];

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [MaintenanceSharedService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    service = TestBed.inject(MaintenanceSharedService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDiagnosticItem', () => {
    it('should return dummy data if useDummyData is true', () => {
      environment.useDummyData = true;
      const expectedData: IStatusCategory[] = DummyData.diagnostics_item;

      service.getDiagnositicItem(mockDepot).subscribe(data => {
        expect(data).toEqual(expectedData);
      });
    });

    it('should make an HTTP GET request if useDummyData is false', () => {
      environment.useDummyData = false;
      const expectedData: IStatusCategory[] = [];

      service.getDiagnositicItem(mockDepot).subscribe(data => {
        expect(data).toEqual(expectedData);
      });

      const req = httpMock.expectOne('');
      expect(req.request.method).toBe('GET');
      req.flush(expectedData);
    });
  });

  describe('getTaskItems', () => {
    it('should return dummy data if useDummyData is true', () => {
      environment.useDummyData = true;
      const expectedData: IEodProcess[] = DummyData.eod_process_tasks;

      service.getTaskItems(mockDepot).subscribe(data => {
        expect(data).toEqual(expectedData);
      });
    });

    it('should make an HTTP GET request if useDummyData is false', () => {
      environment.useDummyData = false;
      const expectedData: IEodProcess[] = [];

      service.getTaskItems(mockDepot).subscribe(data => {
        expect(data).toEqual(expectedData);
      });

      const req = httpMock.expectOne('');
      expect(req.request.method).toBe('GET');
      req.flush(expectedData);
    });
  });

  describe('getUpdateTypeItems', () => {
    it('should return dummy data if useDummyData is true', () => {
      environment.useDummyData = true;
      const expectedData: IUpdateType[] = DummyData['update-type'];

      service.getUpdateTypeItems().subscribe(data => {
        expect(data).toEqual(expectedData);
      });
    });

    it('should make an HTTP GET request if useDummyData is false', () => {
      environment.useDummyData = false;
      const expectedData: IUpdateType[] = [];

      service.getUpdateTypeItems().subscribe(data => {
        expect(data).toEqual(expectedData);
      });

      const req = httpMock.expectOne('');
      expect(req.request.method).toBe('GET');
      req.flush(expectedData);
    });
  });

  describe('getSystemInformation', () => {
    it('should return mdcs dummy data if useDummyData is true and type is mdcs', () => {
      environment.useDummyData = true;
      const expectedData: ISystemInfo[] = DummyData['mdcs-information'];

      service.getSystemInformation('mdcs').subscribe(data => {
        expect(data).toEqual(expectedData);
      });
    });

    it('should return dagw dummy data if useDummyData is true and type is dagw', () => {
      environment.useDummyData = true;
      const expectedData: ISystemInfo[] = DummyData['dagw-information'];

      service.getSystemInformation('dagw').subscribe(data => {
        expect(data).toEqual(expectedData);
      });
    });

    it('should make an HTTP GET request if useDummyData is false', () => {
      environment.useDummyData = false;
      const expectedData: ISystemInfo[] = [];

      service.getSystemInformation('mdcs').subscribe(data => {
        expect(data).toEqual(expectedData);
      });

      const req = httpMock.expectOne('');
      expect(req.request.method).toBe('GET');
      req.flush(expectedData);
    });
  });
});
