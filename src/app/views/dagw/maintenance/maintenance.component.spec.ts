import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { DagwParameterSummaryService } from '@app/services/dagw-parameter-summary.service';
import { MaintenanceSharedService } from '@app/services/maintenance-shared.service';
import DummyData from '@data/db.json';
import { of } from 'rxjs';
import { MaintenanceComponent } from './maintenance.component';
import { DepoService } from '@app/services/depo.service';
import { IDepoList } from '@app/models/depo';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('MaintenanceComponent', () => {
  let component: MaintenanceComponent;
  let fixture: ComponentFixture<MaintenanceComponent>;
  let service: MaintenanceSharedService;
  let mockDagwService: jasmine.SpyObj<DagwParameterSummaryService>;
  let mockRoute: jasmine.SpyObj<ActivatedRoute>;
  let mockDepotService: jasmine.SpyObj<DepoService> = jasmine.createSpyObj(
    'DepoService',
    ['depoList$']
  );

  const mockDepots: IDepoList[] = DummyData.depot_list;

  beforeEach(waitForAsync(() => {
    mockDagwService = jasmine.createSpyObj('DagwParameterSummaryService', [
      'getDepotService',
    ]);

    mockRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        firstChild: { routeConfig: { path: 'maintenance/diagnostics' } },
      },
    });

    mockDepotService.depoList$ = of(mockDepots);

    TestBed.configureTestingModule({
    imports: [ReactiveFormsModule,
        BrowserAnimationsModule],
    providers: [
        MaintenanceSharedService,
        { provide: DagwParameterSummaryService, useValue: mockDagwService },
        { provide: DepoService, useValue: mockDepotService },
        { provide: ActivatedRoute, useValue: mockRoute },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintenanceComponent);
    component = fixture.componentInstance;

    service = TestBed.inject(MaintenanceSharedService);

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load depots and initialize form on ngOnInit', () => {
    spyOn(service, 'setFormGroup').and.callThrough();

    component.ngOnInit();

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
      depot_name: 'Hougang Depot',
      depot_code: 'HD',
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
