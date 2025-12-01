import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IDepoList } from '@app/models/depo';
import { DepoService } from '@app/services/depo.service';
import DummyData from '@data/db.json';
import { of } from 'rxjs';
import { BusArrivalExceptionListComponent } from './bus-arrival-exception-list.component';

describe('BusArrivalExceptionListComponent', () => {
  let component: BusArrivalExceptionListComponent;
  let fixture: ComponentFixture<BusArrivalExceptionListComponent>;

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
    fixture = TestBed.createComponent(BusArrivalExceptionListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form and load selections on ngOnInit', () => {
    component.ngOnInit();

    expect(component.depots).toEqual(mockDepots);
    expect(component.configs.length).toBe(2);
    expect(component.adhocForm).toBeDefined();
    expect(component.adhocForm.get('depots')).toBeTruthy();
  });

  it('should load form configurations correctly', () => {
    component.ngOnInit();

    expect(component.configs.length).toBe(2);
    expect(component.configs[0].controlName).toBe('depots');
    expect(component.configs[0].options?.length).toBe(mockDepots.length);
  });
});
