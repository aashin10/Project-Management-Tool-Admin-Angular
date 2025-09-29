import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Roleslist } from './roleslist';

describe('Roleslist', () => {
  let component: Roleslist;
  let fixture: ComponentFixture<Roleslist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Roleslist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Roleslist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
