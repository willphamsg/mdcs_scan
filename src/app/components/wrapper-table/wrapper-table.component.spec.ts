import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WrapperTableComponent } from './wrapper-table.component';

describe('WrapperTableComponent', () => {
  let component: WrapperTableComponent<any>;
  let fixture: ComponentFixture<WrapperTableComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WrapperTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WrapperTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
