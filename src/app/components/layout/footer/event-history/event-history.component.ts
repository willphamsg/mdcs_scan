import { ChangeDetectorRef, Component } from '@angular/core';
import { DataListComponent } from '@app/components/data-list/data-list.component';
import { IMessage } from '@app/models/message';

@Component({
  selector: 'app-event-history',
  standalone: true,
  imports: [DataListComponent],
  templateUrl: './event-history.component.html',
  styleUrl: './event-history.component.scss',
})
export class EventHistoryComponent {
  eventHistory: IMessage[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.eventHistory = Array(25)
      .fill(null)
      .map(() => ({
        title: 'Event Type',
        message:
          'A new update is available for your application. Click here to install the update now.',
        dateTime: '2024-07-01T09:03:00',
        read: false,
      }));

    this.cdr.detectChanges();
  }
}
