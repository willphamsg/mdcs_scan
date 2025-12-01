import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivatedRoute } from '@angular/router';
import { IMessage } from '@app/models/message';
import { NotificationComponent } from './notification.component';

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;

  const mockNotifications: IMessage[] = [
    {
      title: 'System Update',
      message:
        'A new update is available for your application. Click here to install the update now.',
      dateTime: '2024-07-01T09:03:00',
      read: false,
    },
    {
      title: 'Security Alert',
      message: 'A security patch is now available. Please update immediately.',
      dateTime: '2024-07-02T10:00:00',
      read: false,
    },
    {
      title: 'Maintenance Notice',
      message:
        'Scheduled maintenance is coming up soon. Please be aware of system downtime.',
      dateTime: '2024-07-03T12:30:00',
      read: true,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize notifications', () => {
    expect(component.notifications.length).toBe(3);
  });

  it('should calculate unread items', () => {
    component.notifications = [...mockNotifications];

    expect(component.unreadItems).toBe(2);
  });

  it('should mark all notifications as read', () => {
    spyOn(component, 'markAllAsRead').and.callThrough();
    component.markAllAsRead();

    component.notifications.forEach(notification => {
      expect(notification.read).toBeTrue();
    });
  });
});
