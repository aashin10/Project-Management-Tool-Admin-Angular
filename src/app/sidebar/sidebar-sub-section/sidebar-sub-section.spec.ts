import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarSubSection } from './sidebar-sub-section';

describe('SidebarSubSection', () => {
  let component: SidebarSubSection;
  let fixture: ComponentFixture<SidebarSubSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarSubSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarSubSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
