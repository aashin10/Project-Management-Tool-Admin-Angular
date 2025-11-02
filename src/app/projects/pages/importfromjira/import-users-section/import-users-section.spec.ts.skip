import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportUsersSection } from './import-users-section';
import Papa from 'papaparse';
import { ImportNavigationService } from '../services/import-navigation-service';

describe('ImportUsersSection', () => {
  let component: ImportUsersSection;
  let fixture: ComponentFixture<ImportUsersSection>;
  let mockImportNavigationService: jasmine.SpyObj<ImportNavigationService>;

  beforeEach(async () => {
    // Create a spy for the navigation service
    const importNavigationServiceSpy = jasmine.createSpyObj('Importnavigationservice', ['onNext']);

    await TestBed.configureTestingModule({
      imports: [ImportUsersSection],
      providers: [{ provide: ImportNavigationService, useValue: importNavigationServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportUsersSection);
    component = fixture.componentInstance;
    mockImportNavigationService = TestBed.inject(
      ImportNavigationService
    ) as jasmine.SpyObj<ImportNavigationService>;

    // Mock Papa.parse to simulate successful parsing
    spyOn(Papa, 'parse').and.callFake((_file: any, options: any) =>
      options.complete({ data: [{ name: 'Test User', email: 'test@example.com' }] })
    );

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.uploadSuccess).toBeFalse();
    expect(component.parsedData).toEqual([]);
  });

  it('should handle file upload successfully', () => {
    const mockFile = new File(['name,email\nTest User,test@example.com'], 'test.csv', {
      type: 'text/csv',
    });
    const mockEvent = {
      target: { files: [mockFile] },
    } as any;

    component.onFileUpload(mockEvent);

    expect(Papa.parse).toHaveBeenCalledWith(
      jasmine.any(File),
      jasmine.objectContaining({
        header: true,
        skipEmptyLines: true,
      })
    );
    expect(component.uploadSuccess).toBeTrue();
    expect(component.parsedData).toEqual([{ name: 'Test User', email: 'test@example.com' }]);
  });

  it('should not process upload if no files selected', () => {
    const mockEvent = {
      target: { files: [] },
    } as any;

    component.onFileUpload(mockEvent);

    expect(Papa.parse).not.toHaveBeenCalled();
    expect(component.uploadSuccess).toBeFalse();
  });

  it('should call navigation service on continue', () => {
    component.onContinue();

    expect(mockImportNavigationService.onNext).toHaveBeenCalled();
  });
});
