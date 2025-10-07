import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsMenu } from './actions-menu';

describe('ActionsMenu', () => {
  let component: ActionsMenu;
  let fixture: ComponentFixture<ActionsMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionsMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionsMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
