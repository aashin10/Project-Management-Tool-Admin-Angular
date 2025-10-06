import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamsAndRoles } from './teams-and-roles';

describe('TeamsAndRoles', () => {
  let component: TeamsAndRoles;
  let fixture: ComponentFixture<TeamsAndRoles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamsAndRoles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamsAndRoles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
