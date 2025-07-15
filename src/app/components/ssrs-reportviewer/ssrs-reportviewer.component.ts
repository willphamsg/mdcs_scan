import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  IReportParameter,
  IReportViewerOption,
} from '@models/common';
import { AppConfigService } from '@app/services/app-config.service';

@Component({
  selector: 'app-ssrs-reportviewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ssrs-reportviewer.component.html',
  styleUrl: './ssrs-reportviewer.component.scss',
})
export class SSRSReportViewerComponent implements OnInit, OnChanges, AfterViewInit {
  sanitizedUrl!: SafeResourceUrl;

   @Input() parameter: IReportParameter;
   @Input() reportname: string;
   @Input() option: IReportViewerOption;
   @Output() isIframeLoadedEvent = new EventEmitter<boolean>();
   
  // Report Viewer Parameter
  reportserver: string = '/Pages/ReportViewer.aspx?%2f';
  width: number = 100;
  height: number = 100;

  isIframeLoaded: boolean = false;

  constructor(
    private sanitizer: DomSanitizer,
    private configService: AppConfigService
  ) { }

  ngOnInit(): void {
    // this.loadReport();
    if(this.parameter.businessday === null && this.parameter.depotid === null) {
      this.isIframeLoaded = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['reportname'] || changes['parameter'] || changes['option']) && (this.parameter.businessday != 'NaN-NaN-NaN' && this.parameter.depotid != null)) {
      this.loadReport();
      this.isIframeLoaded = true;
    } else {
      this.isIframeLoaded = false;
    }
  }

  ngAfterViewInit(): void {
    const iframe = document.querySelector('iframe');
    iframe?.addEventListener('load', this.onIframeLoad.bind(this));
  }

  loadReport() {
    let spid = this.parameter.spid === null || this.parameter.spid === 'undefined' ? '':'&SPId=' + this.parameter.spid;
    let businessday = this.parameter.businessday === null || this.parameter.spid === 'NaN-NaN-NaN' ? '':'&BusinessDay=' + this.parameter.businessday;
    let depotid = this.parameter.depotid === null || this.parameter.spid === 'undefined' ? '':'&DepotId=' + this.parameter.depotid;
    let user = this.parameter.user === null || this.parameter.spid === 'undefined' ? '':'&User=' + this.parameter.user;
    let month = this.parameter.month === null || this.parameter.spid === 'undefined' ? '':'&ReportingMonth=' + this.parameter.month;

    let url =
      this.configService.getConfig('reportUrl') + this.reportserver + 
      this.reportname + 
      '&rs:Embed=true&rs:Format=HTML5' +
      '&rc:Toolbar=' + this.option.toolbar +
      '&rc:Parameters=' + this.option.showparameter +
      spid + businessday + depotid + user + month;

    this.sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onIframeLoad(): void {
    this.isIframeLoaded = true;
    this.isIframeLoadedEvent.emit(this.isIframeLoaded);
  }
}
