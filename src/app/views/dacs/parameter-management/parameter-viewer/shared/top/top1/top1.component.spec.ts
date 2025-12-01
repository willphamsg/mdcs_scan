import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Top1Component } from './top1.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('Top1Component', () => {
  let component: Top1Component;
  let fixture: ComponentFixture<Top1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(Top1Component);
    component = fixture.componentInstance;

    component.data = { userData: '' };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
