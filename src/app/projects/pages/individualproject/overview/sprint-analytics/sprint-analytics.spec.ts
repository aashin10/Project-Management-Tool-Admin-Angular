import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SprintAnalyticsComponent } from './sprint-analytics';

describe('SprintAnalyticsComponent', () => {
  let component: SprintAnalyticsComponent;
  let fixture: ComponentFixture<SprintAnalyticsComponent>;

beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [SprintAnalyticsComponent]
  }).compileComponents();

  fixture = TestBed.createComponent(SprintAnalyticsComponent);
  component = fixture.componentInstance;

  //  Provide a mock input
  component.currentSprint = {
    id: 'sprint-1',
    name: 'Sprint 1',
    progress: 50,
    goal: 'Implement features',
    startDate: '2025-10-01',
    endDate: '2025-10-14',
    status: 'Active',
    toDo: 5,
    inProgress: 3,
    done: 2,
    completedStoryPoints: 20,
    totalStoryPoints: 50,
    completedIssues: 5,
    issuesCount: 10
  };

  fixture.detectChanges();
});


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
