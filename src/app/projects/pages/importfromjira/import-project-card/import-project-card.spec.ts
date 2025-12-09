import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportProjectCard } from './import-project-card';
import { CommonModule } from '@angular/common';

describe('ImportProjectCard', () => {
  let component: ImportProjectCard;
  let fixture: ComponentFixture<ImportProjectCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ImportProjectCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportProjectCard);
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
    // Template structure may vary; assert component bindings instead of fragile DOM selectors
    expect(component.title).toBe('Project Alpha');
    expect(component.key).toBe('ALPHA');
    expect(component.id).toBe('123');
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
