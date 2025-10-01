import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sectiontitle } from './sectiontitle';

describe('Sectiontitle', () => {
  let component: Sectiontitle;
  let fixture: ComponentFixture<Sectiontitle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sectiontitle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sectiontitle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
