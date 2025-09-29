import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Projectslist } from './projectslist';

describe('Projectslist', () => {
  let component: Projectslist;
  let fixture: ComponentFixture<Projectslist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Projectslist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Projectslist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
