import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Importfromjira } from './importfromjira';
import { Importnavigationservice } from './importnavigationservice';
import { ActivatedRoute } from '@angular/router';
import { Jiraservice } from './jiraservice';
import { of } from 'rxjs';
import { ImportProcessSection } from '../../components/import-process-section/import-process-section';
import { Sectiontitle } from '../../../shared/sectiontitle/sectiontitle';
import { CustomButton } from '../../../shared/custom-button/custom-button';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

describe('Importfromjira', () => {
  let component: Importfromjira;
  let fixture: ComponentFixture<Importfromjira>;
  let mockNavigationService: jasmine.SpyObj<Importnavigationservice>;
  let mockJiraService: jasmine.SpyObj<Jiraservice>;

  beforeEach(async () => {
    const navSpy = jasmine.createSpyObj('Importnavigationservice', ['next$', 'previous$'], {
      next$: of(null),
      previous$: of(null),
    });

    const jiraSpy = jasmine.createSpyObj('Jiraservice', ['exchangeToken']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, LucideAngularModule],
      declarations: [],
      providers: [
        Importfromjira,
        Sectiontitle,
        ImportProcessSection,
        CustomButton,
        { provide: Importnavigationservice, useValue: navSpy },
        { provide: Jiraservice, useValue: jiraSpy },
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
      Importnavigationservice
    ) as jasmine.SpyObj<Importnavigationservice>;
    mockJiraService = TestBed.inject(Jiraservice) as jasmine.SpyObj<Jiraservice>;

    spyOn(sessionStorage, 'setItem');
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with step 1', () => {
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

  it('should exchange token and go to step 3 if code is in query params', async () => {
    mockJiraService.exchangeToken.and.returnValue(Promise.resolve({ access_token: 'mock-token' }));

    await component.ngOnInit();
    expect(mockJiraService.exchangeToken).toHaveBeenCalledWith('mock-code');
    expect(sessionStorage.setItem).toHaveBeenCalledWith('jira_access_token', 'mock-token');
    expect(component.currentStep).toBe(3);
  });

  it('should render correct step title and description', () => {
    component.currentStep = 2;
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector('app-import-process-section h4');
    const descEl = fixture.nativeElement.querySelector('app-import-process-section p');

    expect(titleEl.textContent).toContain('Authorize with Jira');
    expect(descEl.textContent).toContain('Sign in to your Jira account');
  });

  it('should remove Previous button on step 1', () => {
    component.currentStep = 1;
    fixture.detectChanges();

    const prevBtn = fixture.nativeElement.querySelector('app-custom-button[disabled]');
    expect(prevBtn).toBeNull();
  });
});
