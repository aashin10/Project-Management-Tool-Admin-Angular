
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IndividualprojectComponent } from './individualproject';


describe('IndividualprojectComponent', () => {
  let component: IndividualprojectComponent;
  let fixture: ComponentFixture<IndividualprojectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndividualprojectComponent] // 
    }).compileComponents();

    fixture = TestBed.createComponent(IndividualprojectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
