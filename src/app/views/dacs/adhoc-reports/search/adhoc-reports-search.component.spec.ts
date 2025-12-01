import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IAdhocReport } from '@app/models/adhoc-report-list';
import { PayloadResponse } from '@app/models/common';
import { IDepoList } from '@app/models/depo';
import DummyData from '@data/db.json';
import { AdhocReportService } from '@services/adhoc-report.service';
import { DepoService } from '@services/depo.service';
import { FilterService } from '@services/filter.service';
import { of } from 'rxjs';
import { AdhocReportsComponent } from './adhoc-reports-search.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AdhocReportsComponent', () => {
  let component: AdhocReportsComponent;
  let fixture: ComponentFixture<AdhocReportsComponent>;
  let mockAdhocReportService: jasmine.SpyObj<AdhocReportService>;
  let mockDepoService: jasmine.SpyObj<DepoService>;
  let mockFilterService: jasmine.SpyObj<FilterService>;

  const mockDialogRef = {
    afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of()),
  };

  const mockDialog = {
    open: jasmine.createSpy('open').and.returnValue(mockDialogRef),
  };

  const mockDepots: IDepoList[] = DummyData.depot_list;

  const mockAdhocReportList: IAdhocReport[] = DummyData['adhoc-reports'];
  const mockServiceProviderList: any[] = DummyData.service_provider;

  const mockPayloadResponse: PayloadResponse = {
    status: 200,
    status_code: 'SUCCESS',
    timestamp: Date.now(),
    message: 'Dummy data fetched successfully',
    payload: { 'adhoc-reports': mockAdhocReportList },
  };
  const mockServiceProviderResponse: PayloadResponse = {
    status: 200,
    status_code: 'SUCCESS',
    timestamp: Date.now(),
    message: 'Dummy data fetched successfully',
    payload: { service_provider: mockServiceProviderList },
  };

  beforeEach(waitForAsync(() => {
    mockAdhocReportService = jasmine.createSpyObj('AdhocReportService', [
      'search',
      'getServiceProvider',
    ]);

    mockDepoService = jasmine.createSpyObj('DepoService', [
      'depo$',
      'depoList$',
    ]);

    mockFilterService = jasmine.createSpyObj('FilterService', [
      'getSelectedFilters',
      'updateFormGroup',
      'clearSelectedFilters',
      'updateFilterConfigs',
    ]);

    mockAdhocReportService.search.and.returnValue(of(mockPayloadResponse));
    mockAdhocReportService.getServiceProvider.and.returnValue(
      of(mockServiceProviderResponse)
    );
    mockFilterService.filterConfigs$ = of([]);

    TestBed.configureTestingModule({
    imports: [BrowserAnimationsModule],
    providers: [
        { provide: AdhocReportService, useValue: mockAdhocReportService },
        { provide: DepoService, useValue: mockDepoService },
        { provide: FilterService, useValue: mockFilterService },
        { provide: MatDialog, useValue: mockDialog },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdhocReportsComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load depots and call reloadHandler', () => {
    mockDepoService.depo$ = of('test');
    mockDepoService.depoList$ = of(mockDepots);

    spyOn(component, 'reloadHandler').and.callThrough();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.depots).toEqual(mockDepots);
    expect(component.params.depot_id).toBe('test');
    expect(component.reloadHandler).toHaveBeenCalled();
  });

  it('should load default filter values on afterViewInit', () => {
    component.ngAfterViewInit();
    expect(mockFilterService.updateFilterConfigs).toHaveBeenCalled();
  });

  it('should handle tab change and update filters', () => {
    const tabChangeEvent: MatTabChangeEvent = {
      tab: { textLabel: 'test' } as any,
      index: 1,
    };

    const updateFilterConfigsBasedOnTypeSpy = spyOn<any>(
      component,
      'updateFilterConfigsBasedOnType'
    ).and.callThrough();

    component.onTabChange(tabChangeEvent);
    fixture.detectChanges();

    expect(component.params.report_type).toBe('test');
    expect(mockFilterService.clearSelectedFilters).toHaveBeenCalled();
    expect(updateFilterConfigsBasedOnTypeSpy).toHaveBeenCalled();
  });

  it('should reload report list when reloadHandler is called', () => {
    mockAdhocReportService.search.and.returnValue(of(mockPayloadResponse));
    component.params.depot_id = '1';

    component.reloadHandler();
    fixture.detectChanges();

    expect(mockAdhocReportService.search).toHaveBeenCalled();
    expect(component.dataSource).toEqual(mockAdhocReportList);
  });

  it('should handle checkbox selection', () => {
    const mockEvent = { checked: true } as MatCheckboxChange;
    const element = mockAdhocReportList[0];

    component.checkHandler(mockEvent, element);
    expect(component.selection.length).toBe(1);
    expect(component.selection[0]).toEqual(element);

    mockEvent.checked = false;
    component.checkHandler(mockEvent, element);
    expect(component.selection.length).toBe(0);
  });

  it('should handle select all checkboxes', () => {
    component.params.depot_id = 'testid';
    const mockEvent = { checked: true } as MatCheckboxChange;
    component.dataSource = mockAdhocReportList;

    component.checkAllHandler(mockEvent);
    expect(component.chkAll).toBeTrue();
    expect(component.selection.length).toBe(mockAdhocReportList.length);

    mockEvent.checked = false;
    component.checkAllHandler(mockEvent);
    expect(component.chkAll).toBeFalse();
    expect(component.selection.length).toBe(0);
  });

  it('should open the download dialog', () => {
    component.downloadHandler();
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should unsubscribe from observables on destroy', () => {
    spyOn(component['destroy$'], 'next').and.callThrough();
    spyOn(component['destroy$'], 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
