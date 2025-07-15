import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { IFile } from '@app/models/parameter-management';
import { FileImportExportService } from '@app/services/file-import-export.service';
import { PaginationService } from '@app/services/pagination.service';
import DummyData from '@data/db.json';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { ParameterFileExportComponent } from './parameter-file-export.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ParameterFileExportComponent', () => {
  let component: ParameterFileExportComponent;
  let fixture: ComponentFixture<ParameterFileExportComponent>;
  let mockFileImportExportService: jasmine.SpyObj<FileImportExportService>;
  let mockPaginationService: jasmine.SpyObj<PaginationService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockStore: jasmine.SpyObj<Store>;

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
    mockDialog = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);
    mockStore = jasmine.createSpyObj('Store', ['dispatch']);

    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      providers: [
        {
          provide: FileImportExportService,
          useValue: mockFileImportExportService,
        },
        { provide: PaginationService, useValue: mockPaginationService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: Store, useValue: mockStore },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterFileExportComponent);
    component = fixture.componentInstance;

    mockPaginationService.paginatedData$ = of(
      DummyData.parameter_file_export_data
    );
    mockFileImportExportService.getDepotService.and.returnValue(
      of(DummyData.depot_list)
    );

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on initialization', () => {
    expect(component.dataSource).toEqual(DummyData.parameter_file_export_data);
    expect(mockPaginationService.paginatedData$).toBeTruthy();
  });

  it('should load filter values from the service', () => {
    component.loadFilterValues();
    expect(component.depots).toEqual(DummyData.depot_list);
    expect(component.filterConfigs.length).toBe(2);
  });

  it('should open export dialog when downloadHandler is called', () => {
    component.downloadHandler();
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should close dialog and show success snackbar after 5 seconds', fakeAsync(() => {
    component.downloadHandler();

    tick(5000);

    expect(mockDialog.closeAll).toHaveBeenCalled();
    expect(mockStore.dispatch).toHaveBeenCalled();

    flush();
  }));

  it('should select an individual file when checked', () => {
    const mockEvent = { checked: true } as MatCheckboxChange;
    const mockFile: IFile = {
      id: 1,
      depot: 'Hougang',
      fileId: '0×739A',
      parameterName: 'BUS_CSFA.SYS',
      version: '88',
      type: 'Live',
      status: 'Exported',
      chk: false,
    };

    component.checkHandler(mockEvent, mockFile);
    expect(component.selection.length).toBe(1);
    expect(component.selection[0]).toEqual(mockFile);
  });

  it('should deselect an individual file when unchecked', () => {
    const mockFile: IFile = DummyData.parameter_file_export_data[0];
    component.selection.push(mockFile);

    const mockEvent = { checked: false } as MatCheckboxChange;
    component.checkHandler(mockEvent, mockFile);

    expect(component.selection.length).toBe(0);
  });

  it('should select all files when checkAllHandler is checked', () => {
    const mockEvent = { checked: true } as MatCheckboxChange;
    component.checkAllHandler(mockEvent);
    expect(component.selection.length).toEqual(component.dataSource.length);
  });

  it('should deselect all files when checkAllHandler is unchecked', () => {
    const mockEvent = { checked: false } as MatCheckboxChange;
    component.checkAllHandler(mockEvent);
    expect(component.selection.length).toEqual(0);
  });

  it('should unsubscribe from observables on destroy', () => {
    spyOn(component['destroy$'], 'next').and.callThrough();
    spyOn(component['destroy$'], 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
