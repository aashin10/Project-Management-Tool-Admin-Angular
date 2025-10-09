import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Importprocesssection } from './importprocesssection';
import { CommonModule } from '@angular/common';

describe('Importprocesssection', () => {
  let component: Importprocesssection;
  let fixture: ComponentFixture<Importprocesssection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Importprocesssection, CommonModule],
    }).compileComponents();

    fixture = TestBed.createComponent(Importprocesssection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.icon).toBeNull();
    expect(component.title).toBe('');
    expect(component.description).toBe('');
  });

  it('should bind input values and render them', () => {
    component.title = 'Import Users';
    component.description = 'Upload a CSV file to import users.';
    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('h3');
    expect(titleElement.textContent.trim()).toBe('Import Users');

    const descElement = fixture.nativeElement.querySelector('p');
    expect(descElement.textContent.trim()).toBe('Upload a CSV file to import users.');
  });
});
