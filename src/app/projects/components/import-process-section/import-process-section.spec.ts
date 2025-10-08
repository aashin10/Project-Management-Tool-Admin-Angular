import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ImportProcessSection } from './import-process-section';

describe('ImportProcessSection', () => {
  let component: ImportProcessSection;
  let fixture: ComponentFixture<ImportProcessSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportProcessSection, HttpClientTestingModule],
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

  it('should render ImportUsersSection for stepNumber 1', () => {
    component.stepNumber = 1;
    fixture.detectChanges();

    const importUsersSection = fixture.debugElement.query(By.css('app-import-users-section'));
    expect(importUsersSection).toBeTruthy();

    const authorizeSection = fixture.debugElement.query(By.css('app-authorize-with-jira-section'));
    expect(authorizeSection).toBeFalsy();

    const selectProjectsSection = fixture.debugElement.query(By.css('app-select-projects-section'));
    expect(selectProjectsSection).toBeFalsy();
  });

  it('should render AuthorizeWithJiraSection for stepNumber 2', () => {
    component.stepNumber = 2;
    fixture.detectChanges();

    const importUsersSection = fixture.debugElement.query(By.css('app-import-users-section'));
    expect(importUsersSection).toBeFalsy();

    const authorizeSection = fixture.debugElement.query(By.css('app-authorize-with-jira-section'));
    expect(authorizeSection).toBeTruthy();

    const selectProjectsSection = fixture.debugElement.query(By.css('app-select-projects-section'));
    expect(selectProjectsSection).toBeFalsy();
  });

  it('should render SelectProjectsSection for stepNumber 3', () => {
    component.stepNumber = 3;
    fixture.detectChanges();

    const importUsersSection = fixture.debugElement.query(By.css('app-import-users-section'));
    expect(importUsersSection).toBeFalsy();

    const authorizeSection = fixture.debugElement.query(By.css('app-authorize-with-jira-section'));
    expect(authorizeSection).toBeFalsy();

    const selectProjectsSection = fixture.debugElement.query(By.css('app-select-projects-section'));
    expect(selectProjectsSection).toBeTruthy();
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
