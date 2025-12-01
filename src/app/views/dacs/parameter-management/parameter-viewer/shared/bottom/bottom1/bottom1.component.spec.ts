import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bottom1Component } from './bottom1.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('Bottom1Component', () => {
  let component: Bottom1Component;
  let fixture: ComponentFixture<Bottom1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Bottom1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
