import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

import { Projectslist } from './projectslist';
import { NotificationService } from '../../../shared/services/notification.service';

describe('Projectslist', () => {
  let component: Projectslist;
  let fixture: ComponentFixture<Projectslist>;
  let routerSpy: any;
  let notificationSpy: any;

  beforeEach(async () => {
    routerSpy = { navigate: jasmine.createSpy('navigate') };
    notificationSpy = { addNotification: jasmine.createSpy('addNotification') };

    await TestBed.configureTestingModule({
      imports: [Projectslist],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
        { provide: NotificationService, useValue: notificationSpy },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Projectslist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show loading when isLoading is true', () => {
    component.isLoading = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const loadingText = compiled.querySelector('.flex.items-center.justify-center.py-12 p');
    expect(loadingText?.textContent).toContain('Loading projects');
  });

  it('should navigate to project edit on editProject', () => {
    component.editProject('42');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects', '42', 'edit']);
  });

  it('should delete a project and notify', () => {
    const initialCount = component.projects.length;
    component.projectToDelete = component.projects[0];
    component.confirmDelete();
    expect(component.projects.length).toBeLessThan(initialCount);
    expect(notificationSpy.addNotification).toHaveBeenCalled();
  });

  it('should delete selected projects and notify', () => {
    // mark two projects as selected
    component.projects[0].selected = true;
    component.projects[1].selected = true;
    component.confirmDelete();
    expect(notificationSpy.addNotification).toHaveBeenCalled();
  });

  it('should filter projects by status and search query', () => {
    // start with known projects
    component.searchQuery = 'Atlas';
    component.selectedStatuses = ['Active'];
    fixture.detectChanges();
    const filtered = component.filteredProjects;
    expect(filtered.every(p => p.status === 'Active')).toBeTrue();
    expect(filtered.some(p => p.name.includes('Atlas'))).toBeTrue();
  });

  it('should navigate to individual project when row clicked', () => {
    // simulate handleRowClick with first project's row data
    const row = { actions: component.projects[0].id };
    component.handleRowClick({ row, index: 0 });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects', component.projects[0].id]);
  });

  it('should export all projects when exportAll called', () => {
    spyOn(document, 'createElement').and.callThrough();
    component.exportAll();
    expect(document.createElement).toHaveBeenCalledWith('a');
  });

  it('should display loading error when loadingError is set', () => {
    component.loadingError = 'Failed to load projects';
    component.isLoading = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const errorText = compiled.querySelector('.text-red-900');
    expect(errorText?.textContent).toContain('Failed to load projects');
  });

});
