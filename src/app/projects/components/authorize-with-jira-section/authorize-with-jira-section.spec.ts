import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizeWithJiraSection } from './authorize-with-jira-section';

describe('AuthorizeWithJiraSection', () => {
  let component: AuthorizeWithJiraSection;
  let fixture: ComponentFixture<AuthorizeWithJiraSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorizeWithJiraSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthorizeWithJiraSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
