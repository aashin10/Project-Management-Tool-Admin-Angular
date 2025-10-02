import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Teaminfo } from './teaminfo';

describe('Teaminfo', () => {
  let component: Teaminfo;
  let fixture: ComponentFixture<Teaminfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Teaminfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Teaminfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
