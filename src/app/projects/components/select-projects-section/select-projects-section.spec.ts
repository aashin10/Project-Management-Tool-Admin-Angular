import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectProjectsSection } from './select-projects-section';

describe('SelectProjectsSection', () => {
  let component: SelectProjectsSection;
  let fixture: ComponentFixture<SelectProjectsSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectProjectsSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectProjectsSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
