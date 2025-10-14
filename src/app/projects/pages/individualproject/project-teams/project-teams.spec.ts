import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTeams } from './project-teams';

describe('ProjectTeams', () => {
  let component: ProjectTeams;
  let fixture: ComponentFixture<ProjectTeams>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTeams]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectTeams);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
