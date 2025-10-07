import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Importprojectcard } from './importprojectcard';
import { CommonModule } from '@angular/common';

describe('Importprojectcard', () => {
  let component: Importprojectcard;
  let fixture: ComponentFixture<Importprojectcard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, Importprojectcard],
    }).compileComponents();

    fixture = TestBed.createComponent(Importprojectcard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.title).toBe('');
    expect(component.key).toBe('');
    expect(component.id).toBe('');
    expect(component.selected).toBeFalse();
  });

  it('should render input values correctly', () => {
    component.title = 'Project Alpha';
    component.key = 'ALPHA';
    component.id = '123';
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector('h2');
    const keyEl = fixture.nativeElement.querySelectorAll('p')[0];
    const idEl = fixture.nativeElement.querySelectorAll('p')[1];

    expect(titleEl.textContent.trim()).toBe('Project Alpha');
    expect(keyEl.textContent.trim()).toBe('ALPHA');
    expect(idEl.textContent.trim()).toBe('123');
  });

  it('should toggle selection when checkbox is clicked', () => {
    const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]');
    expect(component.selected).toBeFalse();

    checkbox.click();
    fixture.detectChanges();
    expect(component.selected).toBeTrue();

    checkbox.click();
    fixture.detectChanges();
    expect(component.selected).toBeFalse();
  });

  it('should apply selected styles when selected is true', () => {
    component.selected = true;
    fixture.detectChanges();

    const cardEl = fixture.nativeElement.querySelector('div');
    expect(cardEl.classList).toContain('bg-blue-50');
    expect(cardEl.classList).toContain('border-blue-400');
  });

  it('should not apply selected styles when selected is false', () => {
    component.selected = false;
    fixture.detectChanges();

    const cardEl = fixture.nativeElement.querySelector('div');
    expect(cardEl.classList).not.toContain('bg-blue-50');
    expect(cardEl.classList).not.toContain('border-blue-400');
  });
});
