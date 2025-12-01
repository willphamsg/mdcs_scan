import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IDepoList } from '@app/models/depo';
import { ISystemInfo } from '@app/models/maitenance';
import { MaintenanceSharedService } from '@app/services/maintenance-shared.service';
import { SystemInformationComponent } from './system-information.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SystemInformationComponent', () => {
  let component: SystemInformationComponent;
  let fixture: ComponentFixture<SystemInformationComponent>;
  let service: MaintenanceSharedService;

  const mockDepot: IDepoList = {
    id: 1,
    depot_id: '1',
    version: 1,
    depot_name: 'Hougang Depot',
    depot_code: 'HD',
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [BrowserAnimationsModule],
    providers: [MaintenanceSharedService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemInformationComponent);
    component = fixture.componentInstance;

    service = TestBed.inject(MaintenanceSharedService);

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load system information on initialization', () => {
    spyOn(service, 'getSystemInformation').and.callThrough();
    component.ngOnInit();

    expect(service.getSystemInformation).toHaveBeenCalledWith('mdcs');
    expect(service.getSystemInformation).toHaveBeenCalledWith('dagw');
    expect(component.mdcsInformation$).toBeDefined();
    expect(component.dagwInformation$).toBeDefined();
  });

  it('should subscribe to selectedDepot$ and fetch task items', () => {
    spyOn(component, 'ngOnInit').and.callThrough();
    spyOn(service, 'getTaskItems').and.callThrough();

    component.ngOnInit();
    service.updateSelectedDepot({
      id: 1,
      depot_id: '1',
      version: 1,
      depot_name: 'Hougang Depot',
      depot_code: 'HD',
    });

    expect(component.depot).toEqual(mockDepot);
    expect(service.getTaskItems).toHaveBeenCalledWith(mockDepot);
  });

  it('should handle the case when no depot is selected', () => {
    spyOn(service, 'getTaskItems').and.callThrough();

    component.ngOnInit();
    service.updateSelectedDepot(null);

    expect(component.depot).toBeNull();
    expect(service.getTaskItems).not.toHaveBeenCalled();
  });

  it('should unsubscribe from observables and reset data on destroy', () => {
    spyOn(component['destroy$'], 'next').and.callThrough();
    spyOn(component['destroy$'], 'complete').and.callThrough();
    spyOn(service, 'updateSelectedDepot').and.callThrough();
    spyOn(service, 'resetFormGroup').and.callThrough();

    component.ngOnDestroy();

    expect(service.updateSelectedDepot).toHaveBeenCalled();
    expect(service.resetFormGroup).toHaveBeenCalled();
    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
