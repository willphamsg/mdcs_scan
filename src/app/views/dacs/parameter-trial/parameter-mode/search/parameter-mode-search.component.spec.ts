import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PayloadResponse } from '@app/models/common';
import { IDepoList } from '@app/models/depo';
import { IParameterMode } from '@app/models/parameter-trial';
import { DepoService } from '@app/services/depo.service';
import { FilterService } from '@app/services/filter.service';
import { ParameterModeService } from '@app/services/parameter-mode.service';
import DummyData from '@data/db.json';
import { of } from 'rxjs';
import { ParameterModeSearchComponent } from './parameter-mode-search.component';

describe('ParameterModeSearchComponent', () => {
  let component: ParameterModeSearchComponent;
  let fixture: ComponentFixture<ParameterModeSearchComponent>;
  let mockParameterModeService: jasmine.SpyObj<ParameterModeService>;
  let mockDepoService: jasmine.SpyObj<DepoService>;

  const mockDialogRef = {
    afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of()),
  };

  const mockDialog = {
    open: jasmine.createSpy('open').and.returnValue(mockDialogRef),
  };
  const mockDepots: IDepoList[] = DummyData.depot_list;

  const mockParameterModeList: IParameterMode[] = DummyData.parameter_mode_list;

  const mockPayloadResponse: PayloadResponse = {
    status: 200,
    status_code: 'SUCCESS',
    timestamp: Date.now(),
    message: 'Dummy data fetched successfully',
    payload: { parameter_mode_list: mockParameterModeList },
  };

  const filterServiceSpy = jasmine.createSpyObj('FilterService', [
    'getSelectedFilters',
    'updateFormGroup',
    'clearSelectedFilters',
  ]);

  beforeEach(waitForAsync(() => {
    mockParameterModeService = jasmine.createSpyObj('ParameterModeService', [
      'search',
    ]);
    mockDepoService = jasmine.createSpyObj('DepoService', [
      'depo$',
      'depoList$',
    ]);

    mockDepoService.depo$ = of('test');
    mockDepoService.depoList$ = of(mockDepots);
    mockParameterModeService.search.and.returnValue(of(mockPayloadResponse));

    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      providers: [
        {
          provide: ParameterModeService,
          useValue: mockParameterModeService,
        },
        { provide: DepoService, useValue: mockDepoService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: FilterService, useValue: filterServiceSpy },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterModeSearchComponent);
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

  it('should call fetchParameterModeList on reloadHandler if depot_id is set', () => {
    spyOn(component, 'fetchParameterModeList').and.callThrough();
    component.params.depot_id = '1';

    component.reloadHandler();

    expect(component.fetchParameterModeList).toHaveBeenCalled();
  });

  it('should not call fetchParameterModeList on reloadHandler if depot_id is not set', () => {
    spyOn(component, 'fetchParameterModeList').and.callThrough();
    component.params.depot_id = '';
    component.reloadHandler();
    expect(component.fetchParameterModeList).not.toHaveBeenCalled();
  });

  it('should fetch parameter mode list and update dataSource on fetchParameterModeList', () => {
    component.fetchParameterModeList();

    expect(component.dataSource).toEqual(
      mockParameterModeList.map(item => ({ ...item, chk: false }))
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
    const element = mockParameterModeList[0];
    component.checkHandler(mockEvent, element);
    expect(component.selection.length).toBe(1);
    expect(component.selection[0]).toEqual(element);

    mockEvent.checked = false;
    component.checkHandler(mockEvent, element);
    expect(component.selection.length).toBe(0);
  });

  it('should handle select all checkboxes', () => {
    const mockEvent = { checked: true } as MatCheckboxChange;
    component.dataSource = mockParameterModeList;
    component.checkAllHandler(mockEvent);
    expect(component.chkAll).toBeTrue();
    expect(component.selection.length).toBe(mockParameterModeList.length);

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
