import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportUsersSection } from './import-users-section';
import { RouterTestingModule } from '@angular/router/testing';
import { JiraApi } from '../services/jira-api';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../../../shared/services/notification.service';
import Papa from 'papaparse';
import { ImportNavigationService } from '../services/import-navigation-service';
import { Router } from '@angular/router';

describe('ImportUsersSection', () => {
  let component: ImportUsersSection;
  let fixture: ComponentFixture<ImportUsersSection>;
  let mockImportNavigationService: jasmine.SpyObj<ImportNavigationService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create a spy for the navigation service
    const importNavigationServiceSpy = jasmine.createSpyObj('Importnavigationservice', ['onNext']);
    const mockJiraApi = jasmine.createSpyObj('JiraApi', ['uploadUsersCsv']);
    mockJiraApi.uploadUsersCsv.and.returnValue({ subscribe: (succ: any, err?: any) => { if (succ) succ({}); } } as any);
    const toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info', 'warning', 'clear']);
    const notificationSpy = jasmine.createSpyObj('NotificationService', ['notify']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ImportUsersSection, RouterTestingModule],
      providers: [
        { provide: ImportNavigationService, useValue: importNavigationServiceSpy },
        { provide: JiraApi, useValue: mockJiraApi },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: NotificationService, useValue: notificationSpy },
        { provide: Router, useValue: routerSpy }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportUsersSection);
    component = fixture.componentInstance;
    mockImportNavigationService = TestBed.inject(
      ImportNavigationService
    ) as jasmine.SpyObj<ImportNavigationService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

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
    expect(component.uploadSuccess).toBe(false);
  });

  it('should call navigation service on continue', () => {
    component.onContinue();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects']);
  });
});
