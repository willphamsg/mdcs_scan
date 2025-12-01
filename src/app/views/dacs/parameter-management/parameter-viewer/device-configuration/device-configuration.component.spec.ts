import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DeviceConfigurationComponent } from './device-configuration.component';
import { IParameterBfcConfig } from '@app/models/parameter-management';
import DummyData from '@data/db.json';

describe('DeviceConfigurationComponent', () => {
  let component: DeviceConfigurationComponent;
  let fixture: ComponentFixture<DeviceConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DeviceConfigurationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should split the input bfcConfig array into two equal parts', () => {
    const mockConfig: IParameterBfcConfig[] = DummyData.parameter_bfc_config;

    component.bfcConfig = mockConfig;
    component.ngOnInit()

    const expectedFirstHalf = mockConfig.slice(0, mockConfig.length / 2);
    const expectedSecondHalf = mockConfig.slice(mockConfig.length / 2);

    expect(component.bfcConfig1).toEqual(expectedFirstHalf);
    expect(component.bfcConfig2).toEqual(expectedSecondHalf);
  });
});
