import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthorizeWithJiraSection } from './authorize-with-jira-section';
import { Importnavigationservice } from '../services/import-navigation-service';

describe('AuthorizeWithJiraSection', () => {
  let component: AuthorizeWithJiraSection;
  let fixture: ComponentFixture<AuthorizeWithJiraSection>;
  let mockImportNavigationService: jasmine.SpyObj<Importnavigationservice>;

  beforeEach(async () => {
    const importNavigationServiceSpy = {};

    await TestBed.configureTestingModule({
      imports: [AuthorizeWithJiraSection],
      providers: [{ provide: Importnavigationservice, useValue: importNavigationServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorizeWithJiraSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
