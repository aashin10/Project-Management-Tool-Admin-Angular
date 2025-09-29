import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Createproject } from './createproject';

describe('Createproject', () => {
  let component: Createproject;
  let fixture: ComponentFixture<Createproject>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Createproject]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Createproject);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
