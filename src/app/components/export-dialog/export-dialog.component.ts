import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-export-dialog',
    imports: [MatDialogClose, MatButtonModule],
    templateUrl: './export-dialog.component.html',
    styleUrl: './export-dialog.component.scss'
})
export class ExportDialogComponent {
  dialogTitle = '';
  dialogSubTitle = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
