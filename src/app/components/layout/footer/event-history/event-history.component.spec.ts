import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataListComponent } from '@app/components/data-list/data-list.component';
import { EventHistoryComponent } from './event-history.component';

describe('EventHistoryComponent', () => {
  let component: EventHistoryComponent;
  let fixture: ComponentFixture<EventHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize event history items', () => {
    component.ngOnInit();
    expect(component.eventHistory.length).toBeTruthy();
  });

  it('should render the DataListComponent', () => {
    const dataListElement =
      fixture.nativeElement.querySelector('app-data-list');
    expect(dataListElement).not.toBeNull();
  });
});
