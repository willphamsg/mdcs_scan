import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import DummyData from '@data/db.json';
import { IDepoList } from '@models/depo';
import { DepoService } from '@services/depo.service';
import { CategoryScale, Chart, ChartData, registerables } from 'chart.js';
import { of } from 'rxjs';
import { HomeComponent } from './home.component';

Chart.register(CategoryScale);
Chart.register(...registerables);

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockDepoService: jasmine.SpyObj<DepoService>;

  const mockDepots: IDepoList[] = DummyData.depot_list;

  beforeEach(waitForAsync(() => {
    mockDepoService = jasmine.createSpyObj('DepoService', ['depoList$']);

    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      providers: [
        { provide: DepoService, useValue: mockDepoService },
        provideRouter([]),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    mockDepoService.depoList$ = of(mockDepots);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load depots on init', () => {
    component.ngOnInit();
    fixture.detectChanges();

    mockDepoService.depoList$.subscribe(depots => {
      expect(component.depots).toEqual(mockDepots);
    });
  });

  it('should navigate to the selected depot dashboard', () => {
    const routerStub: Router = TestBed.inject(Router);
    spyOn(routerStub, 'navigate').and.callThrough();

    component.handleSelectDepot({ value: '1' });
    expect(routerStub.navigate).toHaveBeenCalledWith(['/dacs/dashboard', '1']);
  });

  it('should render events', () => {
    const eventElements = fixture.debugElement.queryAll(
      By.css('.event-card .second-text')
    );
    expect(eventElements.length).toBe(component.events.length);
  });

  it('should render taskList', () => {
    const taskElements = fixture.debugElement.queryAll(
      By.css('.task-list-card .second-text')
    );
    expect(taskElements.length).toBe(component.taskList.length);
  });

  it('should render quickLinks', () => {
    const linkElements = fixture.debugElement.queryAll(
      By.css('.quick-link-card .second-text')
    );
    expect(linkElements.length).toBe(component.quickLinks.length);
  });

  it('should update chart data on randomize', () => {
    const originalData = component.barChartData.datasets[0].data;
    component.randomize();
    expect(component.barChartData.datasets[0].data).not.toEqual(originalData);
  });

  it('should call renderArrivedPercentage on AfterViewInit', () => {
    const spy = spyOn<any>(component, 'renderArrivedPercentage');
    component.ngAfterViewInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should update bar chart data correctly', () => {
    component.barChartData = {
      labels: ['Depot A', 'Depot B'],
      datasets: [{ data: [30, 40], label: 'No of Bus' }],
    } as ChartData<'bar'>;

    component.randomize();

    expect(component.barChartData.datasets[0].data.length).toBe(8);
  });
});
