import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PayloadResponse } from '@app/models/common';
import { IReportList } from '@app/models/daily-report';
import { IDepoList } from '@app/models/depo';
import { DailyReportService } from '@app/services/daily-report.service';
import { DepoService } from '@app/services/depo.service';
import { FilterService } from '@app/services/filter.service';
import DummyData from '@data/db.json';
import { of } from 'rxjs';
import { DailyReportComponent } from './daily-report-search.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('DailyReportComponent', () => {
  let component: DailyReportComponent;
  let fixture: ComponentFixture<DailyReportComponent>;
  let mockDailyReportService: jasmine.SpyObj<DailyReportService>;
  let mockDepoService: jasmine.SpyObj<DepoService>;

  const mockDialogRef = {
    afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of()),
  };

  const mockDialog = {
    open: jasmine.createSpy('open').and.returnValue(mockDialogRef),
  };
  const mockDepots: IDepoList[] = DummyData.depot_list;

  const mockEndTrialList: IReportList[] = DummyData['daily-report'];

  const mockPayloadResponse: PayloadResponse = {
    status: 200,
    status_code: 'SUCCESS',
    timestamp: Date.now(),
    message: 'Dummy data fetched successfully',
    payload: { 'daily-report': mockEndTrialList },
  };

  const filterServiceSpy = jasmine.createSpyObj('FilterService', [
    'getSelectedFilters',
    'updateFormGroup',
    'clearSelectedFilters',
  ]);

  beforeEach(waitForAsync(() => {
    mockDailyReportService = jasmine.createSpyObj('DailyReportService', [
      'search',
    ]);
    mockDepoService = jasmine.createSpyObj('DepoService', [
      'depo$',
      'depoList$',
    ]);

    mockDepoService.depo$ = of('test');
    mockDepoService.depoList$ = of(mockDepots);
    mockDailyReportService.search.and.returnValue(of(mockPayloadResponse));

    TestBed.configureTestingModule({
    imports: [BrowserAnimationsModule],
    providers: [
        {
            provide: DailyReportService,
            useValue: mockDailyReportService,
        },
        { provide: DepoService, useValue: mockDepoService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: FilterService, useValue: filterServiceSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyReportComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // it('should load depots and call reloadHandler on depo change', () => {
  //   const mockDepotId = 'testId';
  //   mockDepoService.depo$ = of(mockDepotId);
  //   mockDepoService.depoList$ = of(mockDepots);

  //   spyOn(component, 'reloadHandler');

  //   component.ngOnInit();
  //   fixture.detectChanges();

  //   expect(component.depots).toEqual(mockDepots);
  //   expect(component.params.depot_id).toBe(mockDepotId);
  //   expect(component.reloadHandler).toHaveBeenCalled();
  // });

  it('should set filterConfigs in loadFilterValues', () => {
    component.loadFilterValues();

    expect(component.filterConfigs.length).toBe(3);
    expect(component.filterConfigs[0].controlName).toBe('reportType');
    expect(component.filterConfigs[0].options?.length).toBe(5);
  });

  // it('should call fetchDailyReportList on reloadHandler if depot_id is set', () => {
  //   spyOn(component, 'fetchDailyReportList').and.callThrough();
  //   component.params.depot_id = '1';

  //   component.reloadHandler();

  //   expect(component.fetchDailyReportList).toHaveBeenCalled();
  // });

  // it('should not call fetchDailyReportList on reloadHandler if depot_id is not set', () => {
  //   spyOn(component, 'fetchDailyReportList').and.callThrough();
  //   component.params.depot_id = '';
  //   component.reloadHandler();
  //   expect(component.fetchDailyReportList).not.toHaveBeenCalled();
  // });

  it('should fetch daily report list and update dataSource on fetchDailyReportList', () => {
    component.fetchDailyReportList();

    expect(component.dataSource).toEqual(
      mockEndTrialList.map(item => ({ ...item, chk: false }))
    );
    expect(component.selection.length).toBe(0);
    expect(component.chkAll).toBeFalse();
  });

  // it('should call clearSelectedFilters on tabChange', () => {
  //   const tabChangeEvent = {
  //     tab: { textLabel: 'test' },
  //   } as MatTabChangeEvent;
  //   component.onTabChange(tabChangeEvent);

  //   expect(component.params.report_type).toBe('test');
  //   expect(filterServiceSpy.clearSelectedFilters).toHaveBeenCalled();
  // });

  it('should handle checkbox selection and update selection list', () => {
    const mockEvent = { checked: true } as MatCheckboxChange;
    const element = mockEndTrialList[0];
    component.checkHandler(mockEvent, element);
    expect(component.selection.length).toBe(1);
    expect(component.selection[0]).toEqual(element);

    mockEvent.checked = false;
    component.checkHandler(mockEvent, element);
    expect(component.selection.length).toBe(0);
  });

  it('should handle select all checkboxes', () => {
    const mockEvent = { checked: true } as MatCheckboxChange;
    component.dataSource = mockEndTrialList;
    component.checkAllHandler(mockEvent);
    expect(component.chkAll).toBeTrue();
    expect(component.selection.length).toBe(mockEndTrialList.length);

    mockEvent.checked = false;
    component.checkAllHandler(mockEvent);
    expect(component.chkAll).toBeFalse();
    expect(component.selection.length).toBe(0);
  });

  it('should open dialog when updateView is called', () => {
    component.downloadHandler();

    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should unsubscribe from observables', () => {
    spyOn(component['destroy$'], 'next').and.callThrough();
    spyOn(component['destroy$'], 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
