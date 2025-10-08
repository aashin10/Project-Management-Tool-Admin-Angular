import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sectiontitle } from './sectiontitle';

describe('Sectiontitle', () => {
  let component: Sectiontitle;
  let fixture: ComponentFixture<Sectiontitle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sectiontitle],
    }).compileComponents();

    fixture = TestBed.createComponent(Sectiontitle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display default title and description', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Sample Title');
    expect(compiled.textContent).toContain('Sample Heading');
  });

  it('should display custom title and description', () => {
    component.title = 'Custom Title';
    component.description = 'Custom Description';
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Custom Title');
    expect(compiled.textContent).toContain('Custom Description');
  });
});
