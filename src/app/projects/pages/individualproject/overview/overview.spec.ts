// import { ComponentFixture, TestBed } from '@angular/core/testing';

// import { Overview } from './overview';

// describe('Overview', () => {
//   let component: Overview;
//   let fixture: ComponentFixture<Overview>;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [Overview]
//     })
//     .compileComponents();

//     fixture = TestBed.createComponent(Overview);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverviewComponent } from './overview';


describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewComponent] // 
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
