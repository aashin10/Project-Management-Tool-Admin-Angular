import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Usermenu } from './usermenu';

describe('Usermenu', () => {
  let component: Usermenu;
  let fixture: ComponentFixture<Usermenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Usermenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Usermenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
