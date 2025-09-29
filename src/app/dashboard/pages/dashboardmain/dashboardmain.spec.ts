import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dashboardmain } from './dashboardmain';

describe('Dashboardmain', () => {
  let component: Dashboardmain;
  let fixture: ComponentFixture<Dashboardmain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboardmain]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashboardmain);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
