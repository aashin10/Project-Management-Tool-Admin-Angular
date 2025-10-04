import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Importprojectcard } from './importprojectcard';

describe('Importprojectcard', () => {
  let component: Importprojectcard;
  let fixture: ComponentFixture<Importprojectcard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Importprojectcard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Importprojectcard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
