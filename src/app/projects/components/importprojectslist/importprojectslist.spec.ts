import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Importprojectslist } from './importprojectslist';

describe('Importprojectslist', () => {
  let component: Importprojectslist;
  let fixture: ComponentFixture<Importprojectslist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Importprojectslist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Importprojectslist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
