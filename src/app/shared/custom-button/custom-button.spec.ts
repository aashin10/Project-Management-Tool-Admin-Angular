import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { CustomButton } from './custom-button';

describe('CustomButton', () => {
  let component: CustomButton;
  let fixture: ComponentFixture<CustomButton>;
  let buttonElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomButton);
    component = fixture.componentInstance;
    buttonElement = fixture.debugElement.query(By.css('button'));
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should set label input property', () => {
    component.label = 'Test Button';
    expect(component.label).toBe('Test Button');
  });

  it('should set icon input property', () => {
    component.icon = '/test-icon.svg';
    expect(component.icon).toBe('/test-icon.svg');
  });

  it('should set shortLabel input property', () => {
    component.shortLabel = 'Short';
    expect(component.shortLabel).toBe('Short');
  });

  it('should have default styling properties', () => {
    expect(component.bgClass).toBe('bg-white');
    expect(component.textColor).toBe('text-black');
    expect(component.height).toBe('h-9');
    expect(component.borderClass).toBe('border border-gray-300');
    expect(component.hoverClass).toBe('hover:bg-gray-50');
  });

  it('should set custom styling properties', () => {
    component.bgClass = 'bg-blue-500';
    component.textColor = 'text-white';
    component.height = 'h-12';
    component.borderClass = 'border-none';
    component.hoverClass = 'hover:bg-blue-100';
    component.extraClasses = 'custom-class';

    expect(component.bgClass).toBe('bg-blue-500');
    expect(component.textColor).toBe('text-white');
    expect(component.height).toBe('h-12');
    expect(component.borderClass).toBe('border-none');
    expect(component.hoverClass).toBe('hover:bg-blue-100');
    expect(component.extraClasses).toBe('custom-class');
  });

  it('should have default state properties', () => {
    expect(component.disabled).toBe(false);
    expect(component.loading).toBe(false);
  });

  it('should set disabled state property', () => {
    component.disabled = true;
    expect(component.disabled).toBe(true);
  });

  it('should set loading state property', () => {
    component.loading = true;
    expect(component.loading).toBe(true);
  });

  it('should return default button classes', () => {
    component.label = 'Test';
    const classes = component.buttonClasses;
    expect(classes).toContain('flex');
    expect(classes).toContain('items-center');
    expect(classes).toContain('justify-center');
    expect(classes).toContain('transition-colors');
    expect(classes).toContain('cursor-pointer');
    expect(classes).toContain('bg-white');
    expect(classes).toContain('text-black');
    expect(classes).toContain('h-9');
  });

  it('should include all custom classes in buttonClasses', () => {
    component.label = 'Test';
    component.bgClass = 'bg-red-500';
    component.textColor = 'text-white';
    component.extraClasses = 'custom-class';
    component.height = 'h-10';
    component.borderClass = 'border-2';
    component.hoverClass = 'hover:bg-red-600';

    const classes = component.buttonClasses;
    expect(classes).toContain('bg-red-500');
    expect(classes).toContain('text-white');
    expect(classes).toContain('custom-class');
    expect(classes).toContain('h-10');
    expect(classes).toContain('border-2');
    expect(classes).toContain('hover:bg-red-600');
  });

  it('should add disabled classes when disabled', () => {
    component.label = 'Test';
    component.disabled = true;
    const classes = component.buttonClasses;
    expect(classes).toContain('opacity-50');
    expect(classes).toContain('cursor-not-allowed');
    expect(classes).not.toContain('cursor-pointer');
  });

  it('should add disabled classes when loading', () => {
    component.label = 'Test';
    component.loading = true;
    const classes = component.buttonClasses;
    expect(classes).toContain('opacity-50');
    expect(classes).toContain('cursor-not-allowed');
    expect(classes).not.toContain('cursor-pointer');
  });

  it('should emit action event when clicked and not disabled', () => {
    component.label = 'Test';
    spyOn(component.action, 'emit');
    component.disabled = false;
    component.loading = false;

    component.onClick(new Event('click'));

    expect(component.action.emit).toHaveBeenCalled();
  });

  it('should not emit action event when disabled', () => {
    component.label = 'Test';
    spyOn(component.action, 'emit');
    component.disabled = true;

    component.onClick(new Event('click'));

    expect(component.action.emit).not.toHaveBeenCalled();
  });

  it('should not emit action event when loading', () => {
    component.label = 'Test';
    spyOn(component.action, 'emit');
    component.loading = true;

    component.onClick(new Event('click'));

    expect(component.action.emit).not.toHaveBeenCalled();
  });

  it('should render button element', () => {
    component.label = 'Test Button';
    fixture.detectChanges();
    expect(buttonElement).toBeTruthy();
  });

  it('should display label on desktop screens', () => {
    component.label = 'Test Button';
    fixture.detectChanges();

    const desktopLabel = fixture.debugElement.query(By.css('.hidden.sm\\:inline'));
    expect(desktopLabel.nativeElement.textContent.trim()).toBe('Test Button');
  });

  it('should display short label on mobile when provided', () => {
    component.label = 'Test Button';
    component.shortLabel = 'Short';
    fixture.detectChanges();

    const mobileLabel = fixture.debugElement.query(By.css('.sm\\:hidden'));
    expect(mobileLabel.nativeElement.textContent.trim()).toBe('Short');
  });

  it('should use full label on mobile when no short label', () => {
    component.label = 'Test Button';
    fixture.detectChanges();

    const mobileLabel = fixture.debugElement.query(By.css('.sm\\:hidden'));
    expect(mobileLabel.nativeElement.textContent.trim()).toBe('Test Button');
  });

  it('should render icon when provided and not loading', () => {
    component.label = 'Test Button';
    component.icon = '/test-icon.svg';
    fixture.detectChanges();

    const iconElement = fixture.debugElement.query(By.css('img'));
    expect(iconElement).toBeTruthy();
    expect(iconElement.nativeElement.src).toContain('/test-icon.svg');
    expect(iconElement.nativeElement.alt).toBe('Test Button');
  });

  it('should not render icon when loading', () => {
    component.label = 'Test Button';
    component.icon = '/test-icon.svg';
    component.loading = true;
    fixture.detectChanges();

    const iconElement = fixture.debugElement.query(By.css('img'));
    expect(iconElement).toBeFalsy();
  });

  it('should render loading spinner when loading', () => {
    component.label = 'Test Button';
    component.loading = true;
    fixture.detectChanges();

    const spinnerElement = fixture.debugElement.query(By.css('.animate-spin'));
    expect(spinnerElement).toBeTruthy();
  });

  it('should disable button when disabled property is true', () => {
    component.label = 'Test Button';
    component.disabled = true;
    fixture.detectChanges();

    expect(buttonElement.nativeElement.disabled).toBe(true);
  });

  it('should disable button when loading property is true', () => {
    component.label = 'Test Button';
    component.loading = true;
    fixture.detectChanges();

    expect(buttonElement.nativeElement.disabled).toBe(true);
  });

  it('should apply all button classes to template', () => {
    component.label = 'Test Button';
    fixture.detectChanges();

    const classes = buttonElement.nativeElement.className;
    expect(classes).toContain('flex');
    expect(classes).toContain('items-center');
    expect(classes).toContain('justify-center');
    expect(classes).toContain('bg-white');
    expect(classes).toContain('text-black');
  });

  it('should handle complete custom configuration', () => {
    component.label = 'Complete Button';
    component.shortLabel = 'Complete';
    component.icon = '/icon.svg';
    component.bgClass = 'bg-blue-500';
    component.textColor = 'text-white';
    component.hoverClass = 'hover:bg-blue-600';
    component.extraClasses = 'custom-test-class';
    component.height = 'h-10';
    component.borderClass = 'border-2';
    component.padding = 'px-5';
    component.fontSize = 'text-base';
    component.fontWeight = 'font-bold';
    component.rounded = 'rounded-lg';
    component.gap = 'gap-3';

    fixture.detectChanges();

    const classes = component.buttonClasses;
    expect(classes).toContain('bg-blue-500');
    expect(classes).toContain('text-white');
    expect(classes).toContain('hover:bg-blue-600');
    expect(classes).toContain('custom-test-class');
    expect(classes).toContain('h-10');
    expect(classes).toContain('border-2');
    expect(classes).toContain('px-5');
    expect(classes).toContain('text-base');
    expect(classes).toContain('font-bold');
    expect(classes).toContain('rounded-lg');
    expect(classes).toContain('gap-3');
  });

  it('should handle loading state with all UI changes', () => {
    component.label = 'Loading Button';
    component.loading = true;
    component.icon = '/icon.svg';

    fixture.detectChanges();

    // Loading spinner should be visible
    const spinner = fixture.debugElement.query(By.css('.animate-spin'));
    expect(spinner).toBeTruthy();

    // Icon should be hidden
    const icon = fixture.debugElement.query(By.css('img'));
    expect(icon).toBeFalsy();

    // Button should be disabled
    expect(buttonElement.nativeElement.disabled).toBe(true);

    // Classes should include disabled styling
    const classes = component.buttonClasses;
    expect(classes).toContain('opacity-50');
    expect(classes).toContain('cursor-not-allowed');
  });

  it('should handle disabled state with custom styling', () => {
    component.label = 'Disabled Button';
    component.disabled = true;
    component.bgClass = 'bg-red-500';
    component.textColor = 'text-white';

    fixture.detectChanges();

    const classes = component.buttonClasses;
    expect(classes).toContain('bg-red-500');
    expect(classes).toContain('text-white');
    expect(classes).toContain('opacity-50');
    expect(classes).toContain('cursor-not-allowed');
    expect(classes).not.toContain('cursor-pointer');
    expect(buttonElement.nativeElement.disabled).toBe(true);
  });

  it('should filter out empty classes from buttonClasses', () => {
    component.label = 'Test';
    component.extraClasses = '';
    component.icon = undefined;

    const classes = component.buttonClasses;
    // Should not contain empty strings
    expect(classes.split(' ')).not.toContain('');
    expect(classes).not.toContain('  ');
  });
});
