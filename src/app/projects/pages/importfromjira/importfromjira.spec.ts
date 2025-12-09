import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Importfromjira } from './importfromjira';
import { ImportNavigationService } from './services/import-navigation-service';
import { ActivatedRoute } from '@angular/router';
import { JiraService } from './services/jira-service';
import { of } from 'rxjs';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ImportProcessSection } from './import-process-section/import-process-section';
import { JiraApi } from './services/jira-api';

describe('Importfromjira', () => {
  let component: Importfromjira;
  let fixture: ComponentFixture<Importfromjira>;
  let mockNavigationService: jasmine.SpyObj<ImportNavigationService>;
  let mockJiraService: jasmine.SpyObj<JiraService>;
  let mockJiraApi: jasmine.SpyObj<JiraApi>;

  beforeEach(async () => {
    const navSpy = jasmine.createSpyObj('ImportNavigationService', ['next$', 'previous$'], {
      next$: of(null),
      previous$: of(null),
    });

    const jiraSpy = jasmine.createSpyObj('JiraService', ['exchangeToken']);
    const jiraApiSpy = jasmine.createSpyObj('JiraApi', ['someMethod']); // Add methods as needed

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        LucideAngularModule,
        HttpClientTestingModule,
        Importfromjira,
        Sectiontitle,
        ImportProcessSection,
        CustomButton,
      ],
      providers: [
        { provide: ImportNavigationService, useValue: navSpy },
        { provide: JiraService, useValue: jiraSpy },
        { provide: JiraApi, useValue: jiraApiSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ code: 'mock-code' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Importfromjira);
    component = fixture.componentInstance;
    mockNavigationService = TestBed.inject(
      ImportNavigationService
    ) as jasmine.SpyObj<ImportNavigationService>;
    mockJiraService = TestBed.inject(JiraService) as jasmine.SpyObj<JiraService>;
    mockJiraApi = TestBed.inject(JiraApi) as jasmine.SpyObj<JiraApi>;

    spyOn(sessionStorage, 'setItem');
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with step 1', () => {
    fixture.detectChanges();
    expect(component.currentStep).toBe(1);
  });

  it('should go to next step', () => {
    component.currentStep = 1;
    component.nextStep();
    expect(component.currentStep).toBe(2);
  });

  it('should go to previous step', () => {
    component.currentStep = 2;
    component.previousStep();
    expect(component.currentStep).toBe(1);
  });

  it('should go to specific step using toStep()', () => {
    component.toStep(3);
    expect(component.currentStep).toBe(3);
  });

  it('should exchange token and go to step 2 if code is in query params', fakeAsync(() => {
    mockJiraService.exchangeToken.and.returnValue(Promise.resolve({ access_token: 'mock-token', refresh_token: 'mock-refresh' }));

    component.ngOnInit();
    tick();

    expect(mockJiraService.exchangeToken).toHaveBeenCalledWith('mock-code');
    expect(sessionStorage.setItem).toHaveBeenCalledWith('jira_access_token', 'mock-token');
    expect(sessionStorage.setItem).toHaveBeenCalledWith('jira_refresh_token', 'mock-refresh');
    expect(component.currentStep).toBe(2);
  }));

  it('should render correct step title and description', () => {
    component.currentStep = 1;
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector('app-import-process-section h4');
    const descEl = fixture.nativeElement.querySelector('app-import-process-section p');

    expect(titleEl.textContent).toContain('Authorize with Jira');
    expect(descEl.textContent).toContain('Sign in to your Jira account to access and import projects');
  });

  it('should not show Previous button on step 1', () => {
    component.currentStep = 1;
    fixture.detectChanges();

    const prevBtn = fixture.nativeElement.querySelector('app-custom-button[ng-reflect-label="Previous"]');
    expect(prevBtn).toBeNull();
  });
});
