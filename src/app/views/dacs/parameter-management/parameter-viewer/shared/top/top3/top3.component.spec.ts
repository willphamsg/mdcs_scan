import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IDepoList } from '@app/models/depo';
import { DepoService } from '@app/services/depo.service';
import DummyData from '@data/db.json';
import { of } from 'rxjs';
import { Top3Component } from './top3.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('Top3Component', () => {
  let component: Top3Component;
  let fixture: ComponentFixture<Top3Component>;
  let depotServiceSpy: jasmine.SpyObj<DepoService>;

  depotServiceSpy = jasmine.createSpyObj('DepoService', ['depoList$']);

  const mockDepots: IDepoList[] = DummyData.depot_list;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      providers: [{ provide: DepoService, useValue: depotServiceSpy }],
    }).compileComponents();

    depotServiceSpy.depoList$ = of(mockDepots);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Top3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default radio options', () => {
    expect(component.radioOptions.length).toBe(2);
    expect(component.radioOptions[0].label).toBe('Option 1');
    expect(component.radioOptions[1].label).toBe('Option 2');
  });

  it('should update selected radio option and emit values', () => {
    spyOn(component.valuesEmitter, 'emit');
    spyOn(component.validityEmitter, 'emit');

    component.onSelectionChange('1');
    fixture.detectChanges();

    expect(component.selectedRadio).toBe('1');
    expect(component.valuesEmitter.emit).not.toHaveBeenCalled();
    expect(component.validityEmitter.emit).not.toHaveBeenCalled();
  });

  it('should update selected depot and emit values', () => {
    spyOn(component.valuesEmitter, 'emit');
    spyOn(component.validityEmitter, 'emit');

    component.onDepotChange('test A');
    fixture.detectChanges();

    expect(component.selectedDepot).toBe('test A');
    expect(component.valuesEmitter.emit).not.toHaveBeenCalled();
    expect(component.validityEmitter.emit).not.toHaveBeenCalled();
  });

  it('should emit values when both radio and depot are selected', () => {
    spyOn(component.valuesEmitter, 'emit');
    spyOn(component.validityEmitter, 'emit');

    component.onSelectionChange('1');
    component.onDepotChange('test A');
    fixture.detectChanges();

    expect(component.valuesEmitter.emit).toHaveBeenCalledWith({
      option: '1',
      depot: 'test A',
    });
    expect(component.validityEmitter.emit).toHaveBeenCalledWith(true);
  });

  it('should detect changes when depot is updated', () => {
    const cdrSpy = spyOn(component['cdr'], 'detectChanges');
    component.onDepotChange('test B');
    expect(cdrSpy).toHaveBeenCalled();
  });
});
