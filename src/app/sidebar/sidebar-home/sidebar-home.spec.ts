import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarHome } from './sidebar-home';

describe('SidebarHome', () => {
  let component: SidebarHome;
  let fixture: ComponentFixture<SidebarHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
