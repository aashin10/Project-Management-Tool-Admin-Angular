import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectStatusPie } from './project-status-pie';

describe('ProjectStatusPie', () => {
  let component: ProjectStatusPie;
  let fixture: ComponentFixture<ProjectStatusPie>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectStatusPie]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectStatusPie);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
