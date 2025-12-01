import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IDepoList } from '@app/models/depo';
import { IUpdateType } from '@app/models/maitenance';
import { DagwParameterSummaryService } from '@app/services/dagw-parameter-summary.service';
import { MaintenanceSharedService } from '@app/services/maintenance-shared.service';
import { PaginationService } from '@app/services/pagination.service';
import DummyData from '@data/db.json';
import { of } from 'rxjs';
import { AuditLogComponent } from './audit-log.component';
import { DepoService } from '@app/services/depo.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AuditLogComponent', () => {
  let component: AuditLogComponent;
  let fixture: ComponentFixture<AuditLogComponent>;
  let mockPaginationService: jasmine.SpyObj<PaginationService>;
  let mockDepotService: jasmine.SpyObj<DepoService> = jasmine.createSpyObj(
    'DepoService',
    ['depoList$']
  );
  let sharedService: MaintenanceSharedService;

  const mockDepots: IDepoList[] = DummyData.depot_list;
  const mockUpdateTypes: IUpdateType[] = DummyData['update-type'];

  beforeEach(waitForAsync(() => {
    mockPaginationService = jasmine.createSpyObj('PaginationService', [
      'paginatedData$',
      'loadData',
      'paginateData',
      'getTotalPages',
      'clearPagination',
    ]);

    TestBed.configureTestingModule({
    imports: [BrowserAnimationsModule],
    providers: [
        MaintenanceSharedService,
        { provide: PaginationService, useValue: mockPaginationService },
        {
            provide: DepoService,
            useValue: mockDepotService,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();

    mockDepotService.depoList$ = of(mockDepots);
    mockPaginationService.paginatedData$ = of([]);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditLogComponent);
    component = fixture.componentInstance;

    sharedService = TestBed.inject(MaintenanceSharedService);

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // it('should load audit log items on initialization', () => {
  //   spyOn(sharedService, 'getAuditLogItems').and.callThrough();

  //   component.ngOnInit();

  //   expect(sharedService.getAuditLogItems).toHaveBeenCalled();
  //   expect(component.dataSource$).toBeDefined();
  // });

  // it('should load paginated data on initialization', () => {
  //   component.ngOnInit();

  //   expect(mockPaginationService.paginatedData$).toBeDefined();
  //   expect(component.paginatedData$).toBeDefined();
  // });

  it('should load filter values and configurations', waitForAsync(() => {
    spyOn(sharedService, 'getUpdateTypeItems').and.returnValue(
      of(mockUpdateTypes)
    );

    component.loadFilterValues();

    expect(sharedService.getUpdateTypeItems).toHaveBeenCalled();

    fixture.whenStable().then(() => {
      expect(component.filterConfigs.length).toBe(2);

      const depotsConfig = component.filterConfigs.find(
        config => config.controlName === 'depots'
      );
      expect(depotsConfig).toBeDefined();
      expect(depotsConfig?.options).toEqual(mockDepots);

      const updateTypeConfig = component.filterConfigs.find(
        config => config.controlName === 'updateType'
      );
      expect(updateTypeConfig).toBeDefined();
      expect(updateTypeConfig?.options).toEqual(mockUpdateTypes);
    });
  }));
});
