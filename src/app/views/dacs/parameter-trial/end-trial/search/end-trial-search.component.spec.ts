import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PayloadResponse } from '@app/models/common';
import { IDepoList } from '@app/models/depo';
import { IEndTrial } from '@app/models/parameter-trial';
import { DepoService } from '@app/services/depo.service';
import { EndTrialService } from '@app/services/end-trial.service';
import { FilterService } from '@app/services/filter.service';
import DummyData from '@data/db.json';
import { of } from 'rxjs';
import { EndTrialSearchComponent } from './end-trial-search.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('EndTrialSearchComponent', () => {
  let component: EndTrialSearchComponent;
  let fixture: ComponentFixture<EndTrialSearchComponent>;
  let mockEndTrialService: jasmine.SpyObj<EndTrialService>;
  let mockDepoService: jasmine.SpyObj<DepoService>;

  const mockDialogRef = {
    afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of()),
  };

  const mockDialog = {
    open: jasmine.createSpy('open').and.returnValue(mockDialogRef),
  };
  const mockDepots: IDepoList[] = DummyData.depot_list;

  const mockEndTrialList: IEndTrial[] = DummyData.end_trial_list;

  const mockPayloadResponse: PayloadResponse = {
    status: 200,
    status_code: 'SUCCESS',
    timestamp: Date.now(),
    message: 'Dummy data fetched successfully',
    payload: { end_trial_list: mockEndTrialList },
  };

  const filterServiceSpy = jasmine.createSpyObj('FilterService', [
    'getSelectedFilters',
    'updateFormGroup',
    'clearSelectedFilters',
  ]);

  beforeEach(waitForAsync(() => {
    mockEndTrialService = jasmine.createSpyObj('EndTrialService', ['search']);
    mockDepoService = jasmine.createSpyObj('DepoService', [
      'depo$',
      'depoList$',
    ]);

    mockDepoService.depo$ = of('test');
    mockDepoService.depoList$ = of(mockDepots);
    mockEndTrialService.search.and.returnValue(of(mockPayloadResponse));

    TestBed.configureTestingModule({
    imports: [BrowserAnimationsModule],
    providers: [
        {
            provide: EndTrialService,
            useValue: mockEndTrialService,
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
    fixture = TestBed.createComponent(EndTrialSearchComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call subscribeToDepoChanges', () => {
    spyOn(component, 'subscribeToDepoChanges').and.callThrough();

    component.ngOnInit();

    expect(component.subscribeToDepoChanges).toHaveBeenCalled();
  });

  it('should load depots and set filterConfigs', () => {
    component.ngOnInit();

    expect(component.filterConfigs.length).toBe(1);
    expect(component.filterConfigs[0].controlName).toBe('depots');
    expect(component.filterConfigs[0].options).toEqual(mockDepots);
  });

  it('should call fetchEndTrialList on reloadHandler if depot_id is set', () => {
    spyOn(component, 'fetchEndTrialList').and.callThrough();
    component.params.depot_id = '1';

    component.reloadHandler();

    expect(component.fetchEndTrialList).toHaveBeenCalled();
  });

  it('should not call fetchEndTrialList on reloadHandler if depot_id is not set', () => {
    spyOn(component, 'fetchEndTrialList').and.callThrough();
    component.params.depot_id = '';
    component.reloadHandler();
    expect(component.fetchEndTrialList).not.toHaveBeenCalled();
  });

  it('should fetch end trial list and update dataSource on fetchEndTrialList', () => {
    component.fetchEndTrialList();

    expect(component.dataSource).toEqual(
      mockEndTrialList.map(item => ({ ...item, chk: false }))
    );
    expect(component.selection.length).toBe(0);
    expect(component.chkAll).toBeFalse();
  });

  it('should call clearSelectedFilters on tabChange', () => {
    component.onTabChange();

    expect(filterServiceSpy.clearSelectedFilters).toHaveBeenCalled();
  });

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
    const action = 'test';
    component.updateView(action);
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
