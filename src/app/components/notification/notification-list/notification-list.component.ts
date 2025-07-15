import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DataListComponent } from '@app/components/data-list/data-list.component';
import { BreadcrumbsComponent } from '@app/components/layout/breadcrumbs/breadcrumbs.component';
import { IMessage } from '@app/models/message';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [BreadcrumbsComponent, DataListComponent, CommonModule],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss',
})
export class NotificationListComponent implements OnInit {
  notifications: IMessage[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.notifications = Array(18)
      .fill(null)
      .map(() => ({
        title: 'System Update',
        message:
          'A new update is available for your application. Click here to install the update now.',
        dateTime: '2024-07-01T09:03:00',
        read: false,
      }));

    this.cdr.detectChanges();
  }
}
