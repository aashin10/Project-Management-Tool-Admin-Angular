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

  it('should initialize component correctly', () => {
    expect(component).toBeTruthy();

    // Default properties
    expect(component.label).toBeUndefined();
    expect(component.icon).toBeUndefined();
    expect(component.shortLabel).toBeUndefined();

    // Default styling properties
    expect(component.bgClass).toBe('bg-white');
    expect(component.textColor).toBe('text-black');
    expect(component.height).toBe('h-9');
    expect(component.borderClass).toBe('border border-gray-300');
    expect(component.hoverClass).toBe('hover:bg-gray-50');

    // Default state properties
    expect(component.disabled).toBe(false);
    expect(component.loading).toBe(false);
    expect(component.extraClasses).toBe('');
  });

  it('should handle all input properties correctly', () => {
    // Basic properties
    component.label = 'Test Button';
    component.icon = '/test-icon.svg';
    component.shortLabel = 'Short';
    expect(component.label).toBe('Test Button');
    expect(component.icon).toBe('/test-icon.svg');
    expect(component.shortLabel).toBe('Short');

    // Custom styling properties
    component.bgClass = 'bg-blue-500';
    component.textColor = 'text-white';
    component.height = 'h-12';
    component.borderClass = 'border-none';
    component.hoverClass = 'hover:bg-blue-100';
    component.extraClasses = 'custom-class';
    component.padding = 'px-5';
    component.fontSize = 'text-base';
    component.fontWeight = 'font-bold';
    component.rounded = 'rounded-lg';
    component.gap = 'gap-3';

    expect(component.bgClass).toBe('bg-blue-500');
    expect(component.textColor).toBe('text-white');
    expect(component.height).toBe('h-12');
    expect(component.borderClass).toBe('border-none');
    expect(component.hoverClass).toBe('hover:bg-blue-100');
    expect(component.extraClasses).toBe('custom-class');
    expect(component.padding).toBe('px-5');
    expect(component.fontSize).toBe('text-base');
    expect(component.fontWeight).toBe('font-bold');
    expect(component.rounded).toBe('rounded-lg');
    expect(component.gap).toBe('gap-3');

    // State properties
    component.disabled = true;
    component.loading = true;
    expect(component.disabled).toBe(true);
    expect(component.loading).toBe(true);
  });

  it('should generate correct button classes for all states', () => {
    component.label = 'Test';

    // Default classes
    const defaultClasses = component.buttonClasses;
    expect(defaultClasses).toContain('flex');
    expect(defaultClasses).toContain('items-center');
    expect(defaultClasses).toContain('justify-center');
    expect(defaultClasses).toContain('transition-colors');
    expect(defaultClasses).toContain('cursor-pointer');
    expect(defaultClasses).toContain('bg-white');
    expect(defaultClasses).toContain('text-black');
    expect(defaultClasses).toContain('h-9');

    // Custom classes
    component.bgClass = 'bg-red-500';
    component.textColor = 'text-white';
    component.extraClasses = 'custom-class';
    component.height = 'h-10';
    component.borderClass = 'border-2';
    component.hoverClass = 'hover:bg-red-600';
    component.padding = 'px-5';
    component.fontSize = 'text-base';
    component.fontWeight = 'font-bold';
    component.rounded = 'rounded-lg';
    component.gap = 'gap-3';

    const customClasses = component.buttonClasses;
    expect(customClasses).toContain('bg-red-500');
    expect(customClasses).toContain('text-white');
    expect(customClasses).toContain('custom-class');
    expect(customClasses).toContain('h-10');
    expect(customClasses).toContain('border-2');
    expect(customClasses).toContain('hover:bg-red-600');
    expect(customClasses).toContain('px-5');
    expect(customClasses).toContain('text-base');
    expect(customClasses).toContain('font-bold');
    expect(customClasses).toContain('rounded-lg');
    expect(customClasses).toContain('gap-3');

    // Disabled state
    component.disabled = true;
    const disabledClasses = component.buttonClasses;
    expect(disabledClasses).toContain('opacity-50');
    expect(disabledClasses).toContain('cursor-not-allowed');
    expect(disabledClasses).not.toContain('cursor-pointer');

    // Loading state
    component.disabled = false;
    component.loading = true;
    const loadingClasses = component.buttonClasses;
    expect(loadingClasses).toContain('opacity-50');
    expect(loadingClasses).toContain('cursor-not-allowed');
    expect(loadingClasses).not.toContain('cursor-pointer');

    // Class filtering
    component.extraClasses = '';
    component.icon = undefined;
    const filteredClasses = component.buttonClasses;
    expect(filteredClasses.split(' ')).not.toContain('');
    expect(filteredClasses).not.toContain('  ');
  });

  it('should handle click events correctly', () => {
    component.label = 'Test';
    let emitCount = 0;
    spyOn(component.action, 'emit').and.callFake(() => emitCount++);

    // Normal click - should emit
    component.disabled = false;
    component.loading = false;
    component.onClick(new Event('click'));
    expect(emitCount).toBe(1);

    // Disabled click - should not emit
    component.disabled = true;
    component.loading = false;
    component.onClick(new Event('click'));
    expect(emitCount).toBe(1); // Still only called once

    // Loading click - should not emit
    component.disabled = false;
    component.loading = true;
    component.onClick(new Event('click'));
    expect(emitCount).toBe(1); // Still only called once
  });

  it('should render template correctly for all states', () => {
    // Basic rendering
    component.label = 'Test Button';
    fixture.detectChanges();
    expect(buttonElement).toBeTruthy();

    // Label rendering - desktop
    const desktopLabel = fixture.debugElement.query(By.css('.hidden.sm\\:inline'));
    expect(desktopLabel.nativeElement.textContent.trim()).toBe('Test Button');

    // Label rendering - mobile with short label
    component.shortLabel = 'Short';
    fixture.detectChanges();
    const mobileLabel = fixture.debugElement.query(By.css('.sm\\:hidden'));
    expect(mobileLabel.nativeElement.textContent.trim()).toBe('Short');

    // Label rendering - mobile without short label
    component.shortLabel = undefined;
    fixture.detectChanges();
    const mobileLabelFull = fixture.debugElement.query(By.css('.sm\\:hidden'));
    expect(mobileLabelFull.nativeElement.textContent.trim()).toBe('Test Button');

    // Icon rendering
    component.icon = '/test-icon.svg';
    fixture.detectChanges();
    let iconElement = fixture.debugElement.query(By.css('img'));
    expect(iconElement).toBeTruthy();
    expect(iconElement.nativeElement.src).toContain('/test-icon.svg');
    expect(iconElement.nativeElement.alt).toBe('Test Button');

    // Icon hidden during loading
    component.loading = true;
    fixture.detectChanges();
    iconElement = fixture.debugElement.query(By.css('img'));
    expect(iconElement).toBeFalsy();

    // Loading spinner
    const spinnerElement = fixture.debugElement.query(By.css('.animate-spin'));
    expect(spinnerElement).toBeTruthy();

    // Button disabled states
    expect(buttonElement.nativeElement.disabled).toBe(true); // loading = true

    component.loading = false;
    component.disabled = true;
    fixture.detectChanges();
    expect(buttonElement.nativeElement.disabled).toBe(true);

    // Button classes applied
    const classes = buttonElement.nativeElement.className;
    expect(classes).toContain('flex');
    expect(classes).toContain('items-center');
    expect(classes).toContain('justify-center');
    expect(classes).toContain('bg-white');
    expect(classes).toContain('text-black');
  });

  it('should handle complex configurations and edge cases', () => {
    // Complete custom configuration
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

    const completeClasses = component.buttonClasses;
    expect(completeClasses).toContain('bg-blue-500');
    expect(completeClasses).toContain('text-white');
    expect(completeClasses).toContain('hover:bg-blue-600');
    expect(completeClasses).toContain('custom-test-class');
    expect(completeClasses).toContain('h-10');
    expect(completeClasses).toContain('border-2');
    expect(completeClasses).toContain('px-5');
    expect(completeClasses).toContain('text-base');
    expect(completeClasses).toContain('font-bold');
    expect(completeClasses).toContain('rounded-lg');
    expect(completeClasses).toContain('gap-3');

    // Loading state with all UI changes
    component.loading = true;
    fixture.detectChanges();

    const spinner = fixture.debugElement.query(By.css('.animate-spin'));
    expect(spinner).toBeTruthy();

    const icon = fixture.debugElement.query(By.css('img'));
    expect(icon).toBeFalsy();

    expect(buttonElement.nativeElement.disabled).toBe(true);

    const loadingClasses = component.buttonClasses;
    expect(loadingClasses).toContain('opacity-50');
    expect(loadingClasses).toContain('cursor-not-allowed');

    // Disabled state with custom styling
    component.loading = false;
    component.disabled = true;
    component.bgClass = 'bg-red-500';
    component.textColor = 'text-white';
    fixture.detectChanges();

    const disabledClasses = component.buttonClasses;
    expect(disabledClasses).toContain('bg-red-500');
    expect(disabledClasses).toContain('text-white');
    expect(disabledClasses).toContain('opacity-50');
    expect(disabledClasses).toContain('cursor-not-allowed');
    expect(disabledClasses).not.toContain('cursor-pointer');
    expect(buttonElement.nativeElement.disabled).toBe(true);

    // Edge cases - empty classes filtering
    component.extraClasses = '';
    component.icon = undefined;
    const filteredClasses = component.buttonClasses;
    expect(filteredClasses.split(' ')).not.toContain('');
    expect(filteredClasses).not.toContain('  ');
  });
});
