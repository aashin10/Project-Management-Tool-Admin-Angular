import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Projectpreview } from './projectpreview';

describe('Projectpreview', () => {
  let component: Projectpreview;
  let fixture: ComponentFixture<Projectpreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Projectpreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Projectpreview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
