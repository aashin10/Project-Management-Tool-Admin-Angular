

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverviewComponent } from './overview';
import { CommonModule } from '@angular/common';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewComponent, CommonModule]
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct sprint data', () => {
    expect(component.sprintData).toBeDefined();
    expect(component.sprintData.totalIterations).toBe(8);
    expect(component.sprintData.active).toBe(2);
    expect(component.sprintData.completed).toBe(6);
  });

  it('should initialize with correct work items data', () => {
    expect(component.workItemsData).toBeDefined();
    expect(component.workItemsData.total).toBe(99);
    expect(component.workItemsData.toDo).toBe(24);
    expect(component.workItemsData.inProgress).toBe(8);
    expect(component.workItemsData.done).toBe(67);
  });

  it('should have correct current sprint data', () => {
    expect(component.currentSprint).toBeDefined();
    expect(component.currentSprint.id).toBe('sprint-12');
    expect(component.currentSprint.name).toBe('Sprint 12');
    expect(component.currentSprint.progress).toBe(78);
  });

  it('should initialize with correct number of sprints', () => {
    expect(component.sprints.length).toBe(3);
    expect(component.sprints[0]).toBe(component.currentSprint);
  });

  it('should have correct work types data', () => {
    expect(component.workTypes.length).toBe(4);
    expect(component.workTypes[0].name).toBe('Story');
    expect(component.workTypes[0].percentage).toBe(45);
  });

  it('should have correct work item distribution', () => {
    expect(component.workItemDistribution.length).toBe(3);
    expect(component.workItemDistribution[0].label).toBe('To Do');
    expect(component.workItemDistribution[0].value).toBe(24);
  });

  it('should have correct card data', () => {
    expect(component.cardData.length).toBe(4);
    expect(component.cardData[0].title).toBe('Sprint Iterations');
    expect(component.cardData[0].value).toBe(component.sprintData.totalIterations);
  });

  it('should have correct team members data', () => {
    expect(component.teamMembers.length).toBe(6);
    expect(component.teamMembers[0].name).toBe('Adria Varma');
    expect(component.teamMembers[0].role).toBe('Project Manager');
  });

  it('should emit event when onTeamMembersViewAll is called', () => {
    spyOn(component.viewAllClicked, 'emit');
    component.onTeamMembersViewAll();
    expect(component.viewAllClicked.emit).toHaveBeenCalled();
  });

  it('should log sprint change when onSprintChange is called', () => {
    spyOn(console, 'log');
    component.onSprintChange('sprint-11');
    expect(console.log).toHaveBeenCalledWith('Sprint changed to:', 'sprint-11');
  });

  it('should log export report when onExportReport is called', () => {
    spyOn(console, 'log');
    component.onExportReport();
    expect(console.log).toHaveBeenCalledWith('Export report requested');
  });
});
