import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Top2Component } from './top2.component';

xdescribe('Top2Component', () => {
  let component: Top2Component;
  let fixture: ComponentFixture<Top2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Top2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Top2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
