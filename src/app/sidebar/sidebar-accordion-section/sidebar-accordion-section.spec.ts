import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarAccordionSection } from './sidebar-accordion-section';

describe('SidebarAccordionSection', () => {
  let component: SidebarAccordionSection;
  let fixture: ComponentFixture<SidebarAccordionSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarAccordionSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarAccordionSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
