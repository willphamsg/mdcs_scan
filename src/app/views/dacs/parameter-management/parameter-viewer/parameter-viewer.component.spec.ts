import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  IParameterDepotItems,
  IParameterViewerItems,
} from '@app/models/parameter-management';
import { ParameterViewerService } from '@app/services/parameter-viewer.service';
import { of } from 'rxjs';
import { ParameterViewerComponent } from './parameter-viewer.component';

describe('ParameterViewerComponent', () => {
  let component: ParameterViewerComponent;
  let fixture: ComponentFixture<ParameterViewerComponent>;
  let parameterViewerService: jasmine.SpyObj<ParameterViewerService>;
  let cdr: ChangeDetectorRef;

  beforeEach(async () => {
    const parameterViewerServiceSpy = jasmine.createSpyObj(
      'ParameterViewerService',
      [
        'getSystemParametersItems',
        'getDepotData',
        'getParameterList',
        'getBusList',
        'getSelectedDepotData',
        'getBusCashFareDetails',
        'getUserAccessDetails',
        'getParameterBfcConfig',
      ]
    );
    const cdrSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatTabsModule, BrowserAnimationsModule],
      providers: [
        {
          provide: ParameterViewerService,
          useValue: parameterViewerServiceSpy,
        },
        { provide: ChangeDetectorRef, useValue: cdrSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ParameterViewerComponent);
    component = fixture.componentInstance;
    parameterViewerService = TestBed.inject(
      ParameterViewerService
    ) as jasmine.SpyObj<ParameterViewerService>;
    cdr = TestBed.inject(ChangeDetectorRef);

    parameterViewerService.getDepotData.and.returnValue(
      of({
        item_code: 'DAGW_UA',
        items: [
          {
            id: 1,
            depot_id: '1',
            version: 1,
            depot_name: 'Hougang Depot',
            depot_code: 'HD',
          },
          {
            id: 2,
            depot_id: '2',
            version: 1,
            depot_name: 'Ang Mo Kio Depot',
            depot_code: 'AMKD',
          },
          {
            id: 3,
            depot_id: '3',
            version: 1,
            depot_name: 'Aver Raja Depot Depot',
            depot_code: 'ARDD',
          },
        ],
      })
    );

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set the active tab and load parameters', () => {
      spyOn(component, 'setActiveTab');
      spyOn(component, 'loadParameterItems');

      component.ngOnInit();

      expect(component.setActiveTab).toHaveBeenCalled();
      expect(component.loadParameterItems).toHaveBeenCalledWith(
        component.sideNavHeader
      );
    });
  });

  it('should close all accordions and load parameters for the selected tab', () => {
    const event = { tab: { textLabel: 'DAGW' } } as MatTabChangeEvent;
    spyOn(component.accordion(), 'closeAll');
    spyOn(component, 'loadParameterItems');

    component.onTabChange(event);

    expect(component.accordion().closeAll).toHaveBeenCalled();
    expect(component.loadParameterItems).toHaveBeenCalledWith('DAGW');
    expect(component.sideNavHeader).toEqual('DAGW');
  });

  it('should reset the form, set depot list, and configure form for the selected device', () => {
    const device = { device_type: 'device_config' } as IParameterViewerItems;
    const deviceCode = 'MDCS';
    parameterViewerService.getParameterList.and.returnValue(of([]));

    component.onSelectItem(device, deviceCode);

    expect(component.selectedItem).toEqual(deviceCode);
    expect(component.selectedDevice).toEqual('device_config');
    expect(component.dataSource).toBeNull();
    expect(component.dataSourceDetails).toEqual([]);

    expect(parameterViewerService.getParameterList).toHaveBeenCalledWith(
      deviceCode
    );
    expect(parameterViewerService.getDepotData).toHaveBeenCalledWith(
      deviceCode
    );
  });

  it('should call getSystemParametersItems from service with correct tabCode', () => {
    const tabCode = 'MDCS';
    parameterViewerService.getSystemParametersItems.and.returnValue(of([]));

    component.loadParameterItems(tabCode);

    expect(
      parameterViewerService.getSystemParametersItems
    ).toHaveBeenCalledWith(tabCode);
    expect(component.parameterDeviceItems$).toBeDefined();
  });

  it('should map depot data correctly', () => {
    const item = 'MDCS';
    const depotItems = {
      items: [{ depot_id: '1', depot_name: 'Depot 1' }],
    } as IParameterDepotItems;
    parameterViewerService.getDepotData.and.returnValue(of(depotItems));

    component.setDepotList(item);

    expect(parameterViewerService.getDepotData).toHaveBeenCalledWith(item);
    component.depots$.subscribe(depots => {
      expect(depots).toEqual(depotItems.items);
    });
  });

  it('should unsubscribe on ngOnDestroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
