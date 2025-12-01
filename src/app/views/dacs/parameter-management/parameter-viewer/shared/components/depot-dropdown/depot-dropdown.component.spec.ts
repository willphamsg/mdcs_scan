import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IDepoList } from '@app/models/depo';
import { DepoService } from '@app/services/depo.service';
import DummyData from '@data/db.json';
import { DepotDropdownComponent } from './depot-dropdown.component';
import { of } from 'rxjs';

describe('DepotDropdownComponent', () => {
  let component: DepotDropdownComponent;
  let fixture: ComponentFixture<DepotDropdownComponent>;
  let depotServiceSpy: jasmine.SpyObj<DepoService>;

  depotServiceSpy = jasmine.createSpyObj('DepoService', ['depoList$']);

  const mockDepots: IDepoList[] = DummyData.depot_list;
  depotServiceSpy.depoList$ = of(mockDepots);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      providers: [{ provide: DepoService, useValue: depotServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(DepotDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
