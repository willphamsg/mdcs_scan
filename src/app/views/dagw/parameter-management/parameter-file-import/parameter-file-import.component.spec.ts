import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { FileImportExportService } from '@app/services/file-import-export.service';
import { PaginationService } from '@app/services/pagination.service';
import DummyData from '@data/db.json';
import { of } from 'rxjs';
import { ParameterFileImportComponent } from './parameter-file-import.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ParameterFileImportComponent', () => {
  let component: ParameterFileImportComponent;
  let fixture: ComponentFixture<ParameterFileImportComponent>;
  let mockFileImportExportService: jasmine.SpyObj<FileImportExportService>;
  let mockPaginationService: jasmine.SpyObj<PaginationService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(waitForAsync(() => {
    mockFileImportExportService = jasmine.createSpyObj(
      'FileImportExportService',
      ['getDepotService']
    );
    mockPaginationService = jasmine.createSpyObj('PaginationService', [
      'paginatedData$',
      'loadData',
      'paginateData',
      'getTotalPages',
      'clearPagination',
    ]);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      providers: [
        {
          provide: FileImportExportService,
          useValue: mockFileImportExportService,
        },
        { provide: PaginationService, useValue: mockPaginationService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterFileImportComponent);
    component = fixture.componentInstance;

    mockPaginationService.paginatedData$ = of(DummyData.parameter_file_data);
    mockFileImportExportService.getDepotService.and.returnValue(
      of(DummyData.depot_list)
    );

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with data from the service', () => {
    expect(component.dataSource).toEqual(DummyData.parameter_file_data);
    expect(mockPaginationService.paginatedData$).toBeTruthy();
  });

  it('should call loadFilterValues on init', () => {
    spyOn(component, 'loadFilterValues').and.callThrough();
    component.ngOnInit();
    expect(component.loadFilterValues).toHaveBeenCalled();
  });

  it('should load depots and filter values from the service', () => {
    component.loadFilterValues();
    expect(component.depots).toEqual(DummyData.depot_list);
    expect(component.filterConfigs.length).toBe(2);
  });

  it('should open a dialog when openView is called', () => {
    component.openView();
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should unsubscribe from observables', () => {
    spyOn(component['destroy$'], 'next').and.callThrough();
    spyOn(component['destroy$'], 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
