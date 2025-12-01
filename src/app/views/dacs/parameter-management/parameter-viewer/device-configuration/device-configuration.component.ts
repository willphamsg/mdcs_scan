import { Component, Input, OnInit } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { IParameterBfcConfig } from '@app/models/parameter-management';

@Component({
    selector: 'app-device-configuration',
    imports: [MatGridListModule],
    templateUrl: './device-configuration.component.html',
    styleUrl: './device-configuration.component.scss'
})
export class DeviceConfigurationComponent implements OnInit {
  @Input() bfcConfig: IParameterBfcConfig[] = [];
  bfcConfig1: IParameterBfcConfig[] = [];
  bfcConfig2: IParameterBfcConfig[] = [];

  ngOnInit(): void {
    this.bfcConfig1 = this.bfcConfig.slice(0, this.bfcConfig.length / 2);
    this.bfcConfig2 = this.bfcConfig.slice(this.bfcConfig.length / 2);
  }
}
