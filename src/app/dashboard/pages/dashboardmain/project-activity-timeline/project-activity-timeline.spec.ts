import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectActivityTimeline } from './project-activity-timeline';

describe('ProjectActivityTimeline', () => {
  let component: ProjectActivityTimeline;
  let fixture: ComponentFixture<ProjectActivityTimeline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectActivityTimeline]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectActivityTimeline);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
