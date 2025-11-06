import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportProjectCardList } from './import-project-card-list';
import { ImportProjectCard } from '../import-project-card/import-project-card';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { CustomButton } from '../../../../shared/custom-button/custom-button';

describe('ImportProjectCardList', () => {
  let component: ImportProjectCardList;
  let fixture: ComponentFixture<ImportProjectCardList>;

  const mockProjects = [
    { name: 'Project 1', key: 'P1', id: '1', selected: false, style: '' },
    { name: 'Project 2', key: 'P2', id: '2', selected: false, style: '' },
    { name: 'Project 3', key: 'P3', id: '3', selected: false, style: '' },
    { name: 'Project 4', key: 'P4', id: '4', selected: false, style: '' },
    { name: 'Project 5', key: 'P5', id: '5', selected: false, style: '' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ImportProjectCardList, ImportProjectCard, CustomButton],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportProjectCardList);
    component = fixture.componentInstance;
    component.projects = mockProjects;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct pagination', () => {
    expect(component.currentPage).toBe(1);
    expect(component.itemsPerPage).toBe(5);
    expect(component.paginatedProjects.length).toBe(5);
    expect(component.paginatedProjects[0].name).toBe('Project 1');
  });

  it('should calculate total pages correctly', () => {
    expect(component.totalPages).toBe(1); // 5 projects, 5 per page
  });

  it('should go to page 2 and update paginatedProjects', () => {
    // Since itemsPerPage is 5, there is only 1 page. Calling goToPage(2) should have no effect.
    component.goToPage(2);
    fixture.detectChanges();

    expect(component.currentPage).toBe(1);
    expect(component.paginatedProjects.length).toBe(5);
    expect(component.paginatedProjects[0].name).toBe('Project 1');
  });
  it('should disable Previous button on first page', () => {
    const buttons = fixture.debugElement.queryAll(By.directive(CustomButton));
    const previousButton = buttons.find(
      (btn) => (btn.componentInstance as CustomButton).label === 'Previous'
    );

    expect(previousButton).toBeTruthy();
    expect((previousButton!.componentInstance as CustomButton).disabled).toBeTrue();
  });

  it('should disable Next button on last page', () => {
    component.goToPage(component.totalPages);
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.directive(CustomButton));
    const nextButton = buttons.find(
      (btn) => (btn.componentInstance as CustomButton).label === 'Next'
    );

    expect(nextButton).toBeTruthy();
    expect((nextButton!.componentInstance as CustomButton).disabled).toBeTrue();
  });
});
