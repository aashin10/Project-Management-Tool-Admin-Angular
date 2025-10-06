import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicInformationComponent } from './basicinfo';

describe('BasicInformationComponent', () => {
  let component: BasicInformationComponent;
  let fixture: ComponentFixture<BasicInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
