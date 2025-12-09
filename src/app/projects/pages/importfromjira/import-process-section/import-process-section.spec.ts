import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ImportProcessSection } from './import-process-section';
import { ToastrService } from 'ngx-toastr';
import { RouterTestingModule } from '@angular/router/testing';
import { JiraApi } from '../services/jira-api';
import { JiraService } from '../services/jira-service';

describe('ImportProcessSection', () => {
  let component: ImportProcessSection;
  let fixture: ComponentFixture<ImportProcessSection>;

  beforeEach(async () => {
    const toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info', 'warning', 'clear']);
    const jiraApiSpy = jasmine.createSpyObj('JiraApi', ['importProjectsFromJira', 'uploadUsersCsv']);
    const jiraServiceSpy = jasmine.createSpyObj('JiraService', ['exchangeToken', 'getAccessibleResources', 'fetchJiraProjects']);

    await TestBed.configureTestingModule({
      imports: [ImportProcessSection, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: ToastrService, useValue: toastrSpy },
        { provide: JiraApi, useValue: jiraApiSpy },
        { provide: JiraService, useValue: jiraServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImportProcessSection);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.icon).toBe('');
    expect(component.title).toBe('');
    expect(component.description).toBe('');
    expect(component.stepNumber).toBe(1);
  });

  it('should bind input properties correctly', () => {
    component.icon = '/path/to/icon.png';
    component.title = 'Test Title';
    component.description = 'Test Description';
    component.stepNumber = 2;
    fixture.detectChanges();

    const imgElement = fixture.debugElement.query(By.css('img'));
    expect(imgElement.nativeElement.src).toContain('/path/to/icon.png');

    const titleElement = fixture.debugElement.query(By.css('h4'));
    expect(titleElement.nativeElement.textContent.trim()).toBe('Test Title');

    const descElement = fixture.debugElement.query(By.css('p'));
    expect(descElement.nativeElement.textContent.trim()).toBe('Test Description');
  });

  it('should render AuthorizeWithJiraSection for stepNumber 1', () => {
    component.stepNumber = 1;
    fixture.detectChanges();

    const authorizeSection = fixture.debugElement.query(By.css('app-authorize-with-jira-section'));
    expect(authorizeSection).toBeTruthy();

    const importUsersSection = fixture.debugElement.query(By.css('app-import-users-section'));
    expect(importUsersSection).toBeFalsy();

    const selectProjectsSection = fixture.debugElement.query(By.css('app-select-projects-section'));
    expect(selectProjectsSection).toBeFalsy();
  });

  it('should render SelectProjectsSection for stepNumber 2', () => {
    component.stepNumber = 2;
    fixture.detectChanges();

    const selectProjectsSection = fixture.debugElement.query(By.css('app-select-projects-section'));
    expect(selectProjectsSection).toBeTruthy();

    const importUsersSection = fixture.debugElement.query(By.css('app-import-users-section'));
    expect(importUsersSection).toBeFalsy();

    const authorizeSection = fixture.debugElement.query(By.css('app-authorize-with-jira-section'));
    expect(authorizeSection).toBeFalsy();
  });

  it('should render ImportUsersSection for stepNumber 3', () => {
    component.stepNumber = 3;
    fixture.detectChanges();

    const importUsersSection = fixture.debugElement.query(By.css('app-import-users-section'));
    expect(importUsersSection).toBeTruthy();

    const authorizeSection = fixture.debugElement.query(By.css('app-authorize-with-jira-section'));
    expect(authorizeSection).toBeFalsy();

    const selectProjectsSection = fixture.debugElement.query(By.css('app-select-projects-section'));
    expect(selectProjectsSection).toBeFalsy();
  });

  it('should not render any section for invalid stepNumber', () => {
    component.stepNumber = 4;
    fixture.detectChanges();

    const importUsersSection = fixture.debugElement.query(By.css('app-import-users-section'));
    expect(importUsersSection).toBeFalsy();

    const authorizeSection = fixture.debugElement.query(By.css('app-authorize-with-jira-section'));
    expect(authorizeSection).toBeFalsy();

    const selectProjectsSection = fixture.debugElement.query(By.css('app-select-projects-section'));
    expect(selectProjectsSection).toBeFalsy();
  });
});
