import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Importfromjira } from './importfromjira';

describe('Importfromjira', () => {
  let component: Importfromjira;
  let fixture: ComponentFixture<Importfromjira>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Importfromjira]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Importfromjira);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
