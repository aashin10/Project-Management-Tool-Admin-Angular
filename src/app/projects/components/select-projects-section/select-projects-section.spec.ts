import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectProjectsSection } from './select-projects-section';
import { Jiraservice } from '../../pages/importfromjira/jiraservice';
import { Importprojectslist } from '../importprojectslist/importprojectslist';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { LoadingIndicator } from '../../../shared/loading-indicator/loading-indicator';
import { CommonModule } from '@angular/common';

describe('SelectProjectsSection', () => {
  let component: SelectProjectsSection;
  let fixture: ComponentFixture<SelectProjectsSection>;
  let mockJiraService: jasmine.SpyObj<Jiraservice>;

  const mockProjects = [
    { name: 'Project A', key: 'PA', id: '1' },
    { name: 'Project B', key: 'PB', id: '2' },
  ];

  beforeEach(async () => {
    const jiraServiceSpy = jasmine.createSpyObj('Jiraservice', [
      'getAccessibleResources',
      'fetchJiraProjects',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        SelectProjectsSection,
        Importprojectslist,
        CustomButton,
        SearchBar,
        LoadingIndicator,
      ],
      providers: [
        { provide: Jiraservice, useValue: jiraServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectProjectsSection);
    component = fixture.componentInstance;
    mockJiraService = TestBed.inject(Jiraservice) as jasmine.SpyObj<Jiraservice>;
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
    spyOn(sessionStorage, 'getItem').and.returnValue('mock-token');

    // Mock the service calls to return resolved promises
    mockJiraService.getAccessibleResources.and.returnValue(Promise.resolve([{ id: 'cloud-123' }]));
    mockJiraService.fetchJiraProjects.and.returnValue(Promise.resolve(mockProjects));

    // Verify initial state
    expect(component.loadingProjects).toBe(false);
    expect(component.projects.length).toBe(0);

    // Call ngOnInit manually
    await component.ngOnInit();

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
