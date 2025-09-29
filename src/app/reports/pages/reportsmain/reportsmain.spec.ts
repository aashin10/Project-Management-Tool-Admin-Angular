import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reportsmain } from './reportsmain';

describe('Reportsmain', () => {
  let component: Reportsmain;
  let fixture: ComponentFixture<Reportsmain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reportsmain]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Reportsmain);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
