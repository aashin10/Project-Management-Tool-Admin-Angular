import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Settingsmain } from './settingsmain';

describe('Settingsmain', () => {
  let component: Settingsmain;
  let fixture: ComponentFixture<Settingsmain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Settingsmain]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Settingsmain);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
