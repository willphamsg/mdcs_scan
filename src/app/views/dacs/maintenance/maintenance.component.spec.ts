import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { DagwParameterSummaryService } from '@app/services/dagw-parameter-summary.service';
import { MaintenanceSharedService } from '@app/services/maintenance-shared.service';
import DummyData from '@data/db.json';
import { of } from 'rxjs';
import { MaintenanceComponent } from './maintenance.component';

describe('MaintenanceComponent', () => {
  let component: MaintenanceComponent;
  let fixture: ComponentFixture<MaintenanceComponent>;
  let service: MaintenanceSharedService;
  let mockDagwService: jasmine.SpyObj<DagwParameterSummaryService>;
  let mockRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(waitForAsync(() => {
    mockDagwService = jasmine.createSpyObj('DagwParameterSummaryService', [
      'getDepotService',
    ]);

    mockRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        firstChild: { routeConfig: { path: 'maintenance/diagnostics' } },
      },
    });

    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
      ],
      providers: [
        MaintenanceSharedService,
        { provide: DagwParameterSummaryService, useValue: mockDagwService },
        { provide: ActivatedRoute, useValue: mockRoute },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintenanceComponent);
    component = fixture.componentInstance;

    service = TestBed.inject(MaintenanceSharedService);
    mockDagwService.getDepotService.and.returnValue(
      of(DummyData.dagw_depot_list)
    );
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load depots and initialize form on ngOnInit', () => {
    spyOn(service, 'setFormGroup').and.callThrough();

    component.ngOnInit();

    expect(mockDagwService.getDepotService).toHaveBeenCalled();
    expect(service.setFormGroup).toHaveBeenCalled();
  });

  it('should update selected depot on form value change', () => {
    spyOn(service, 'updateSelectedDepot').and.callThrough();
    component.loadDepotsAndInitForm();

    const formValue = { depots: '1' };
    component.depotForm.setValue(formValue);

    expect(component.selectedDepot).toEqual({
      id: 1,
      depot_id: '1',
      version: 1,
      depot_name: 'Ang Mo Kio Depot',
      depot_code: 'AMKD',
    });
    expect(service.updateSelectedDepot).toHaveBeenCalled();
  });

  it('should initialize filter configurations on init', () => {
    component.initFilterConfigs();

    expect(component.filterConfigs.length).toBe(3); // 3 filters in the mock configuration
    expect(component.filterConfigs[0].controlName).toBe('status');
  });

  it('should return correct page title based on route', () => {
    const title = component.getPageTitle();
    expect(title).toBe('Diagnostics');
  });

  it('should unsubscribe on ngOnDestroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
