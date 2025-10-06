import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesModal } from './roles-modal';

describe('RolesModal', () => {
  let component: RolesModal;
  let fixture: ComponentFixture<RolesModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
