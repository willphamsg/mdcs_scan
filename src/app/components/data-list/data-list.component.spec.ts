import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IMessage } from '@app/models/message';
import { PaginationService } from '@app/services/pagination.service';
import { of } from 'rxjs';
import { DataListComponent } from './data-list.component';

describe('DataListComponent', () => {
  let component: DataListComponent;
  let fixture: ComponentFixture<DataListComponent>;
  let mockPaginationService: jasmine.SpyObj<PaginationService>;

  const mockNotifications: IMessage[] = [
    {
      title: 'test1',
      message: 'test1',
      dateTime: '2024-07-01T10:00:00',
      read: false,
    },
    {
      title: 'test2',
      message: 'test2',
      dateTime: '2024-07-01T10:00:00',
      read: false,
    },
  ];

  beforeEach(async () => {
    mockPaginationService = jasmine.createSpyObj('PaginationService', [
      'paginatedData$',
      'loadData',
      'paginateData',
      'getTotalPages',
      'clearPagination',
      'handlePageEvent',
    ]);
    mockPaginationService.paginatedData$ = of(mockNotifications);

    await TestBed.configureTestingModule({
      providers: [
        { provide: PaginationService, useValue: mockPaginationService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set the headerName', () => {
    component.headerName = 'test';
    fixture.detectChanges();

    expect(component.headerName).toBe('test');
  });

  it('should accept a list of notifications', () => {
    component.list = mockNotifications;
    fixture.detectChanges();
    expect(component.list.length).toBe(2);
  });

  it('should subscribe to paginatedList$', () => {
    component.ngOnInit();
    component.paginatedList$.subscribe(data => {
      expect(data.length).toBe(2);
      expect(data).toEqual(mockNotifications);
    });
  });
});
