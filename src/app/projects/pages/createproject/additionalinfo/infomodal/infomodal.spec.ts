import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Infomodal } from './infomodal';

describe('Infomodal', () => {
  let component: Infomodal;
  let fixture: ComponentFixture<Infomodal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Infomodal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Infomodal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
