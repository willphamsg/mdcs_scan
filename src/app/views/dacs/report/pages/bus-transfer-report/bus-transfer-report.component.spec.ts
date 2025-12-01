import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IDepoList } from '@app/models/depo';
import { DepoService } from '@app/services/depo.service';
import DummyData from '@data/db.json';
import { of } from 'rxjs';
import { BusTransferReportComponent } from './bus-transfer-report.component';

describe('BusTransferReportComponent', () => {
  let component: BusTransferReportComponent;
  let fixture: ComponentFixture<BusTransferReportComponent>;
  let depotServiceSpy: jasmine.SpyObj<DepoService>;

  depotServiceSpy = jasmine.createSpyObj('DepoService', ['depoList$']);

  const mockDepots: IDepoList[] = DummyData.depot_list;

  beforeEach(waitForAsync(() => {
    depotServiceSpy.depoList$ = of(mockDepots);

    TestBed.configureTestingModule({
      imports: [],
      providers: [{ provide: DepoService, useValue: depotServiceSpy }],
    }).compileComponents();

    depotServiceSpy = TestBed.inject(
      DepoService
    ) as jasmine.SpyObj<DepoService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusTransferReportComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form and load selections on ngOnInit', () => {
    component.ngOnInit();

    expect(component.depots).toEqual(mockDepots);
    expect(component.configs.length).toBe(5);
    expect(component.adhocForm).toBeDefined();
    expect(component.adhocForm.get('currDepot')).toBeTruthy();
  });

  it('should load form configurations correctly', () => {
    component.ngOnInit();

    expect(component.configs.length).toBe(5);
    expect(component.configs[0].controlName).toBe('currDepot');
    expect(component.configs[0].options?.length).toBe(mockDepots.length);
  });
});
