import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { IndividualprojectComponent } from './individualproject';
import { NotificationService } from '../../../shared/services/notification.service';

describe('IndividualprojectComponent (focused)', () => {
  let component: IndividualprojectComponent;
  let fixture: ComponentFixture<IndividualprojectComponent>;
  let routerSpy: any;
  let notificationSpy: any;

  beforeEach(async () => {
    routerSpy = { navigate: jasmine.createSpy('navigate') };
    notificationSpy = { addNotification: jasmine.createSpy('addNotification') };

    await TestBed.configureTestingModule({
      imports: [IndividualprojectComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
        { provide: NotificationService, useValue: notificationSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IndividualprojectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show loading message when isLoading true', () => {
    component.isLoading = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent).toContain('Loading project');
  });

  it('should navigate to edit page on editProject', () => {
    component.projectId = '5';
    component.editProject();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects', '5', 'edit']);
  });

  it('should open delete modal and confirm delete triggers notification and navigation', () => {
    component.projectId = '7';
    component.project = { name: 'Test Project', code: 'T1', status: 'ongoing', description: '', avatar: 'TP', avatarColor: '#000' } as any;

    component.deleteProject();
    expect(component.showDeleteModal).toBeTrue();

    component.confirmDelete();
    expect(notificationSpy.addNotification).toHaveBeenCalledWith('success', `Project "Test Project" was deleted.`, 'Project Deleted');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects'], { queryParams: { deleted: '7' } });
  });

  it('should cancel delete modal', () => {
    component.showDeleteModal = true;
    component.cancelDelete();
    expect(component.showDeleteModal).toBeFalse();
  });

  it('should navigate back to projects list', () => {
    component.goBackToProjects();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects']);
  });

  it('should retry fetch project', () => {
    spyOn(component, 'fetchProject');
    component.retryFetchProject();
    expect(component.fetchProject).toHaveBeenCalled();
  });

  it('should open website in new tab', () => {
    spyOn(window, 'open');
    component.openWebsite();
    expect(window.open).toHaveBeenCalledWith('https://www.acmecorp.com', '_blank');
  });


  it('should format date', () => {
    expect(component.formatDate('Jan 2, 2025')).toBe('Jan 2, 2025');
  });


  it('should initialize with project ID from route', () => {
    expect(component.projectId).toBe('1');
  });

  it('should load project data from service', () => {
    expect(component.project).toBeTruthy();
    expect(component.project?.name).toBe('Atlas App');
    expect(component.project?.projectCode).toBe('PROJ-001');
  });
});