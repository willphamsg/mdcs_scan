import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataListComponent } from '@app/components/data-list/data-list.component';
import { EventHistoryComponent } from './event-history.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EventHistoryComponent', () => {
  let component: EventHistoryComponent;
  let fixture: ComponentFixture<EventHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, DataListComponent],
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

    expect(component.filterConfigs.length).toBe(2);
  });
});
