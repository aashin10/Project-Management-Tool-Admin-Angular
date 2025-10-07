import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Importprocesssection } from './importprocesssection';

describe('Importprocesssection', () => {
  let component: Importprocesssection;
  let fixture: ComponentFixture<Importprocesssection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Importprocesssection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Importprocesssection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
