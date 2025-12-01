import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import DummyData from '@data/db.json';
import { environment } from '@env/environment';
import { IParams, PayloadResponse } from '../models/common';
import { ManageBusExceptionListService } from './bus-exception-list.service';
import { DynamicEndpoint } from './dynamic-endpoint';
import { of } from 'rxjs';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FileImportExportService } from './file-import-export.service';
import { IFile } from '@app/models/parameter-management';

describe('FileImportExportService', () => {
  let service: FileImportExportService;
  let httpMock: HttpTestingController;

  const mockResponse = DummyData.parameter_file_data;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [FileImportExportService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    service = TestBed.inject(FileImportExportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return dummy data when useDummyData is true', () => {
    spyOn(service, 'getImportedList').and.callFake(() => of(mockResponse));

    environment.useDummyData = true;

    service.getImportedList().subscribe((response: IFile[]) => {
      expect(response).toEqual(mockResponse);
    });
  });

  it('should send a search request and return data', () => {
    environment.useDummyData = false;

    service.getImportedList().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    httpMock.verify();
  });
});
