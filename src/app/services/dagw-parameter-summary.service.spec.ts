import { HttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { IDepoList } from '@app/models/depo';
import DummyData from '@data/db.json';
import { environment } from '@env/environment';
import { of } from 'rxjs';
import { PayloadResponse } from '../models/common';
import { ManageBusExceptionListService } from './bus-exception-list.service';
import { DagwParameterSummaryService } from './dagw-parameter-summary.service';
import { DynamicEndpoint } from './dynamic-endpoint';

describe('DagwParameterSummaryService', () => {
  let service: DagwParameterSummaryService;
  let httpClientMock: HttpClient;
  let httpMock: HttpTestingController;
  let mockDynamicEndpoint: jasmine.SpyObj<DynamicEndpoint>;

  const mockParams = {
    page_size: 10,
    page_index: 0,
    sort_order: [],
    search_text: '',
    search_select_filter: {},
  };

  const mockResponse: PayloadResponse = {
    status: 200,
    status_code: 'SUCCESS',
    timestamp: Date.now(),
    message: 'Dummy data fetched successfully',
    payload: DummyData,
  };
  const mockDepots: IDepoList[] = DummyData.depot_list;

  beforeEach(() => {
    mockDynamicEndpoint = jasmine.createSpyObj('DynamicEndpoint', [
      'setDynamicEndpoint',
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ManageBusExceptionListService,
        { provide: DynamicEndpoint, useValue: mockDynamicEndpoint },
      ],
    });

    service = TestBed.inject(DagwParameterSummaryService);
    httpClientMock = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);

    environment.gateway = 'http://mock-api/';
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a search request and return data', () => {
    spyOn(service, 'search').and.returnValue(of(mockResponse));

    service.search(mockParams).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  });

  it('should return dummy depot data when useDummyData is true', () => {
    environment.useDummyData = true;
    const dummyData = DummyData.dagw_depot_list;

    service.getDepotService('').subscribe(depots => {
      expect(depots).toEqual(
        dummyData.map(depot => ({
          ...depot,
          value: depot.depot_name,
        }))
      );
    });

    httpMock.expectNone('');
  });

  it('should make an HTTP call when useDummyData is false', () => {
    environment.useDummyData = false;

    service.getDagwDataList('type').subscribe();

    const req = httpMock.expectOne('');
    expect(req.request.method).toBe('GET');
    req.flush(mockDepots);
  });
});
