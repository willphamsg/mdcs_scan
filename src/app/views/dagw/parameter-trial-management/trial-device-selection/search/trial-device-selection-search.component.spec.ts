import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ITrialDeviceSelection } from '@app/models/parameter-trial';
import DummyData from '@data/db.json';
import { PayloadResponse } from '@models/common';
import { IDepoList } from '@models/depo';
import { DepoService } from '@services/depo.service';
import { NewParameterApprovalService } from '@services/new-parameter-approval.service';
import { of } from 'rxjs';
import { TrialDeviceSelectionSearchComponent } from './trial-device-selection-search.component';

describe('TrialDeviceSelectionSearchComponent', () => {
  let component: TrialDeviceSelectionSearchComponent;
  let fixture: ComponentFixture<TrialDeviceSelectionSearchComponent>;
  let mockNewParameterApprovalService: jasmine.SpyObj<NewParameterApprovalService>;
  let mockDepoService: jasmine.SpyObj<DepoService>;

  const mockPayloadResponse: PayloadResponse = {
    status: 200,
    status_code: 'SUCCESS',
    timestamp: Date.now(),
    message: 'Dummy data fetched successfully',
    payload: DummyData,
  };

  const mockDepots: IDepoList[] = DummyData.depot_list;

  const mockTrialList: ITrialDeviceSelection[] =
    DummyData.trial_device_summary_list.map(data => ({
      ...data,
      depot: 'test',
    }));

  const filterServiceSpy = jasmine.createSpyObj('FilterService', [
    'getSelectedFilters',
    'updateFormGroup',
    'clearSelectedFilters',
  ]);

  mockDepoService = jasmine.createSpyObj('DepoService', ['depoList$']);

  const mockDialogRef = {
    afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of()),
  };

  const mockDialog = {
    open: jasmine.createSpy('open').and.returnValue(mockDialogRef),
  };
  mockNewParameterApprovalService = jasmine.createSpyObj(
    'NewParameterApprovalService',
    ['search']
  );

  beforeEach(waitForAsync(() => {
    mockDepoService.depo$ = of('test');
    mockDepoService.depoList$ = of(mockDepots);
    mockNewParameterApprovalService.search.and.returnValue(
      of(mockPayloadResponse)
    );

    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      providers: [
        {
          provide: NewParameterApprovalService,
          useValue: mockNewParameterApprovalService,
        },
        { provide: DepoService, useValue: mockDepoService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrialDeviceSelectionSearchComponent);
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

  it('should handle check all action', () => {
    const mockEvent = { checked: true } as MatCheckboxChange;
    component.dataSource = mockTrialList;

    component.checkAllHandler(mockEvent);
    expect(component.selection.length).toBe(mockTrialList.length);
    expect(component.chkAll).toBeTrue();

    mockEvent.checked = false;
    component.checkAllHandler(mockEvent);
    expect(component.selection.length).toBe(0);
    expect(component.chkAll).toBeFalse();
  });

  it('should set filterConfigs in loadFilterValues', () => {
    component.loadFilterValues();

    expect(component.filterConfigs.length).toBe(1);
    expect(component.filterConfigs[0].controlName).toBe('depots');
    expect(component.filterConfigs[0].options?.length).toBe(mockDepots.length);
  });

  it('should load depots and call reloadHandler on depo change', () => {
    spyOn(component, 'reloadHandler').and.callThrough();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.depots).toEqual(mockDepots);
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
