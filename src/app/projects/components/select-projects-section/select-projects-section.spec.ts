import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { SelectProjectsSection } from './select-projects-section';
import { Jiraservice } from '../../pages/importfromjira/jiraservice';
import { Importprojectslist } from '../importprojectslist/importprojectslist';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { LoadingIndicator } from '../../../shared/loading-indicator/loading-indicator';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

fdescribe('SelectProjectsSection', () => {
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
      imports: [CommonModule],
      providers: [
        { provide: Jiraservice, useValue: jiraServiceSpy },
        SelectProjectsSection,
        Importprojectslist,
        CustomButton,
        SearchBar,
        LoadingIndicator,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectProjectsSection);
    component = fixture.componentInstance;
    mockJiraService = TestBed.inject(Jiraservice) as jasmine.SpyObj<Jiraservice>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show loading indicator when loading projects', fakeAsync(() => {
    component.loadingProjects = true;
    fixture.detectChanges();
    tick();

    const loadingEl = fixture.debugElement.query(By.directive(LoadingIndicator));
    expect(loadingEl).toBeTruthy();
  }));

  it('should fetch and populate projects on init', async () => {
    spyOn(sessionStorage, 'getItem').and.returnValue('mock-token');
    mockJiraService.getAccessibleResources.and.returnValue(Promise.resolve([{ id: 'cloud-123' }]));
    mockJiraService.fetchJiraProjects.and.returnValue(Promise.resolve(mockProjects));

    await component.ngOnInit();
    fixture.detectChanges();

    expect(mockJiraService.getAccessibleResources).toHaveBeenCalledWith('mock-token');
    expect(mockJiraService.fetchJiraProjects).toHaveBeenCalledWith('mock-token', 'cloud-123');
    expect(component.projects.length).toBe(2);
    expect(component.projects[0].name).toBe('Project A');
    expect(component.loadingProjects).toBeFalse();

    const listEl = fixture.nativeElement.querySelector('app-importprojectslist');
    expect(listEl).toBeTruthy();
  });
});
