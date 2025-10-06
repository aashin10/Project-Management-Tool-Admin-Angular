import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamOrganizationComponent } from './teaminfo';

describe('TeamOrganizationComponent', () => {
  let component: TeamOrganizationComponent;
  let fixture: ComponentFixture<TeamOrganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamOrganizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
