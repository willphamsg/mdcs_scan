import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IDepoList } from '@app/models/depo';
import { FilterService } from '@app/services/filter.service';
import { MaintenanceSharedService } from '@app/services/maintenance-shared.service';
import { EodProcessComponent } from './eod-process.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('EodProcessComponent', () => {
  let component: EodProcessComponent;
  let fixture: ComponentFixture<EodProcessComponent>;
  let sharedService: MaintenanceSharedService;
  let filterService: FilterService;

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
    providers: [MaintenanceSharedService, FilterService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EodProcessComponent);
    component = fixture.componentInstance;

    sharedService = TestBed.inject(MaintenanceSharedService);
    filterService = TestBed.inject(FilterService);

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to selectedDepot$ and fetch task items', () => {
    spyOn(component, 'ngOnInit').and.callThrough();
    spyOn(sharedService, 'getTaskItems').and.callThrough();

    component.ngOnInit();
    sharedService.updateSelectedDepot({
      id: 1,
      depot_id: '1',
      version: 1,
      depot_name: 'Hougang Depot',
      depot_code: 'HD',
    });

    expect(component.depot).toEqual(mockDepot);
    expect(sharedService.getTaskItems).toHaveBeenCalledWith(mockDepot);
  });

  it('should unsubscribe from observables and reset data on destroy', () => {
    spyOn(component['destroy$'], 'next').and.callThrough();
    spyOn(component['destroy$'], 'complete').and.callThrough();
    spyOn(sharedService, 'updateSelectedDepot').and.callThrough();
    spyOn(sharedService, 'resetFormGroup').and.callThrough();
    spyOn(filterService, 'clearSelectedFilters').and.callThrough();

    component.ngOnDestroy();

    expect(sharedService.updateSelectedDepot).toHaveBeenCalled();
    expect(sharedService.resetFormGroup).toHaveBeenCalled();
    expect(filterService.clearSelectedFilters).toHaveBeenCalled();
    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
