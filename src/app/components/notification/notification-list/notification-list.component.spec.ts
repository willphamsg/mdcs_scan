import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationListComponent } from './notification-list.component';
import { DataListComponent } from '@app/components/data-list/data-list.component';

describe('NotificationListComponent', () => {
  let component: NotificationListComponent;
  let fixture: ComponentFixture<NotificationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize notification items', () => {
    component.ngOnInit();
    expect(component.notifications.length).toBeTruthy();
  });

  it('should render the DataListComponent', () => {
    const dataListElement =
      fixture.nativeElement.querySelector('app-data-list');
    expect(dataListElement).not.toBeNull();
  });
});
