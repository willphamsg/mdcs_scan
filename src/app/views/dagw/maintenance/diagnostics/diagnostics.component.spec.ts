import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IDepoList } from '@app/models/depo';
import { IStatusCategory } from '@app/models/maitenance';
import { MaintenanceSharedService } from '@app/services/maintenance-shared.service';
import DummyData from '@data/db.json';
import { Subject } from 'rxjs';
import { DiagnosticsComponent } from './diagnostics.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('DiagnosticsComponent', () => {
  let component: DiagnosticsComponent;
  let fixture: ComponentFixture<DiagnosticsComponent>;
  let sharedService: MaintenanceSharedService;

  const mockDepot: IDepoList = {
    id: 1,
    depot_id: '1',
    version: 1,
    depot_name: 'Hougang Depot',
    depot_code: 'HD',
  };

  const mockCategoryItems: IStatusCategory[] = DummyData.diagnostics_item;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [BrowserAnimationsModule],
    providers: [MaintenanceSharedService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagnosticsComponent);
    component = fixture.componentInstance;

    sharedService = TestBed.inject(MaintenanceSharedService);

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to selectedDepot$ and fetch diagnostic items', () => {
    spyOn(component, 'ngOnInit').and.callThrough();
    spyOn(sharedService, 'getDiagnositicItem').and.callThrough();
    const selectedDepotSubject = new Subject<IDepoList>();
    sharedService.selectedDepot$ = selectedDepotSubject.asObservable();

    selectedDepotSubject.next(mockDepot);

    component.ngOnInit();
    sharedService.updateSelectedDepot(mockDepot);

    expect(component.depot).toEqual(mockDepot);
    expect(sharedService.getDiagnositicItem).toHaveBeenCalled();
    sharedService.selectedDepot$.subscribe(() => {
      expect(component.categoryItems).toEqual(mockCategoryItems);
    });
  });

  it('should handle the case when no depot is selected', () => {
    spyOn(sharedService, 'getDiagnositicItem').and.callThrough();
    component.ngOnInit();
    sharedService.updateSelectedDepot(null);

    expect(component.depot).toBeNull();
    expect(sharedService.getDiagnositicItem).not.toHaveBeenCalled();
  });

  it('should unsubscribe from observables and reset data on destroy', () => {
    spyOn(component['destroy$'], 'next').and.callThrough();
    spyOn(component['destroy$'], 'complete').and.callThrough();
    spyOn(sharedService, 'updateSelectedDepot').and.callThrough();
    spyOn(sharedService, 'resetFormGroup').and.callThrough();

    component.ngOnDestroy();

    expect(sharedService.updateSelectedDepot).toHaveBeenCalled();
    expect(sharedService.resetFormGroup).toHaveBeenCalled();
    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
