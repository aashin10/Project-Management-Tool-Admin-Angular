import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Deliveryunitslist } from './deliveryunitslist';

describe('Deliveryunitslist', () => {
  let component: Deliveryunitslist;
  let fixture: ComponentFixture<Deliveryunitslist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Deliveryunitslist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Deliveryunitslist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
