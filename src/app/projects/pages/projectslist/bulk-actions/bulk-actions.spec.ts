import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkActions } from './bulk-actions';

describe('BulkActions', () => {
  let component: BulkActions;
  let fixture: ComponentFixture<BulkActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkActions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkActions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
