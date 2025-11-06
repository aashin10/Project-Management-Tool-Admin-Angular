import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { SelectProjectsSection } from './select-projects-section';
import { CommonModule } from '@angular/common';
import { JiraService } from '../services/jira-service';
import { ToastrService } from 'ngx-toastr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ImportProjectCardList } from '../import-projects-list/import-project-card-list';
import { CustomButton } from '../../../../shared/custom-button/custom-button';
import { SearchBar } from '../../../../shared/components/search-bar/search-bar';
import { LoadingIndicator } from '../../../../shared/loading-indicator/loading-indicator';
import { JiraApi } from '../services/jira-api';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ImportNavigationService } from '../services/import-navigation-service';

describe('SelectProjectsSection', () => {
  let component: SelectProjectsSection;
  let fixture: ComponentFixture<SelectProjectsSection>;
  let mockJiraService: jasmine.SpyObj<JiraService>;

  const mockProjects = [
    { name: 'Project A', key: 'PA', id: '1', style: 'next-gen', selected: false },
    { name: 'Project B', key: 'PB', id: '2', style: 'next-gen', selected: false },
  ];

  beforeEach(async () => {
    const jiraServiceSpy = jasmine.createSpyObj('Jiraservice', [
      'getAccessibleResources',
      'fetchJiraProjects',
      'isJwtExpired',
      'refreshAccessToken'
    ]);

    const toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info', 'warning', 'clear']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        SelectProjectsSection,
        ImportProjectCardList,
        CustomButton,
        SearchBar,
        LoadingIndicator,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: JiraService, useValue: jiraServiceSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectProjectsSection);
    component = fixture.componentInstance;
    mockJiraService = TestBed.inject(JiraService) as jasmine.SpyObj<JiraService>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should manage loading state correctly', () => {
    // Test that loadingProjects property can be set and retrieved
    expect(component.loadingProjects).toBe(false); // Initial state

    component.loadingProjects = true;
    expect(component.loadingProjects).toBe(true);

    component.loadingProjects = false;
    expect(component.loadingProjects).toBe(false);
  });

  it('should fetch and populate projects on init', async () => {
    // Mock sessionStorage
    spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'jira_access_token') return 'mock-token';
      if (key === 'isImporting') return 'false';
      return null;
    });

    // Mock the service calls to return resolved promises
    mockJiraService.isJwtExpired.and.returnValue(false);
    mockJiraService.getAccessibleResources.and.returnValue(
      Promise.resolve([{ id: 'cloud-123', name: 'Mock Cloud', url: '' }])
    );
    mockJiraService.fetchJiraProjects.and.returnValue(
      Promise.resolve([
        {
          name: 'Project A',
          key: 'PA',
          id: '1',
          selected: false,
          style: 'next-gen'
        },
        {
          name: 'Project B',
          key: 'PB',
          id: '2',
          selected: false,
          style: 'next-gen'
        },
      ])
    );

    // Verify initial state
    expect(component.loadingProjects).toBe(false);
    expect(component.projects.length).toBe(0);

    // Call ngOnInit and wait for all async operations
    await component.ngOnInit();

    // Wait for change detection
    fixture.detectChanges();
    await fixture.whenStable();

    // Verify service calls were made correctly
    expect(mockJiraService.getAccessibleResources).toHaveBeenCalledWith('mock-token');
    expect(mockJiraService.fetchJiraProjects).toHaveBeenCalledWith('mock-token', 'cloud-123');

    // Verify component state after initialization
    expect(component.projects.length).toBe(2);
    expect(component.projects[0].name).toBe('Project A');
    expect(component.projects[1].name).toBe('Project B');
    expect(component.loadingProjects).toBe(false);
  });
});
