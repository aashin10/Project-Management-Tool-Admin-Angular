import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarSingleSection } from './sidebar-single-section';

describe('SidebarSingleSection', () => {
  let component: SidebarSingleSection;
  let fixture: ComponentFixture<SidebarSingleSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarSingleSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarSingleSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
