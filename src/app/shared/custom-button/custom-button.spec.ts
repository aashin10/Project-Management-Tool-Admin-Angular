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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    beforeEach(() => {
      component.label = 'Test Button';
      fixture.detectChanges();
    });

    it('should set label input', () => {
      expect(component.label).toBe('Test Button');
    });

    it('should set icon input', () => {
      component.icon = '/test-icon.svg';
      expect(component.icon).toBe('/test-icon.svg');
    });

    it('should set shortLabel input', () => {
      component.shortLabel = 'Short';
      expect(component.shortLabel).toBe('Short');
    });

    it('should have default background class', () => {
      expect(component.bgClass).toBe('bg-white');
    });

    it('should set custom background class', () => {
      component.bgClass = 'bg-blue-500';
      expect(component.bgClass).toBe('bg-blue-500');
    });

    it('should have default text color', () => {
      expect(component.textColor).toBe('text-black');
    });

    it('should set custom text color', () => {
      component.textColor = 'text-white';
      expect(component.textColor).toBe('text-white');
    });

    it('should have default height', () => {
      expect(component.height).toBe('h-9');
    });

    it('should set custom height', () => {
      component.height = 'h-12';
      expect(component.height).toBe('h-12');
    });

    it('should have default border class', () => {
      expect(component.borderClass).toBe('border border-gray-300');
    });

    it('should set custom border class', () => {
      component.borderClass = 'border-none';
      expect(component.borderClass).toBe('border-none');
    });

    it('should have default hover class', () => {
      expect(component.hoverClass).toBe('hover:bg-gray-50');
    });

    it('should set custom hover class', () => {
      component.hoverClass = 'hover:bg-blue-100';
      expect(component.hoverClass).toBe('hover:bg-blue-100');
    });

    it('should have default disabled state', () => {
      expect(component.disabled).toBe(false);
    });

    it('should set disabled state', () => {
      component.disabled = true;
      expect(component.disabled).toBe(true);
    });

    it('should have default loading state', () => {
      expect(component.loading).toBe(false);
    });

    it('should set loading state', () => {
      component.loading = true;
      expect(component.loading).toBe(true);
    });
  });

  describe('buttonClasses getter', () => {
    beforeEach(() => {
      component.label = 'Test';
      fixture.detectChanges();
    });

    it('should return default classes', () => {
      const classes = component.buttonClasses;
      expect(classes).toContain('flex');
      expect(classes).toContain('items-center');
      expect(classes).toContain('justify-center');
      expect(classes).toContain('transition-colors');
      expect(classes).toContain('cursor-pointer');
    });

    it('should include custom classes', () => {
      component.bgClass = 'bg-red-500';
      component.extraClasses = 'custom-class';
      const classes = component.buttonClasses;
      expect(classes).toContain('bg-red-500');
      expect(classes).toContain('custom-class');
    });

    it('should add disabled classes when disabled', () => {
      component.disabled = true;
      const classes = component.buttonClasses;
      expect(classes).toContain('opacity-50');
      expect(classes).toContain('cursor-not-allowed');
      expect(classes).not.toContain('cursor-pointer');
    });

    it('should add disabled classes when loading', () => {
      component.loading = true;
      const classes = component.buttonClasses;
      expect(classes).toContain('opacity-50');
      expect(classes).toContain('cursor-not-allowed');
      expect(classes).not.toContain('cursor-pointer');
    });
  });

  describe('onClick method', () => {
    beforeEach(() => {
      component.label = 'Test';
      spyOn(component.action, 'emit');
    });

    it('should emit action event when not disabled or loading', () => {
      component.disabled = false;
      component.loading = false;

      component.onClick(new Event('click'));

      expect(component.action.emit).toHaveBeenCalled();
    });

    it('should not emit action event when disabled', () => {
      component.disabled = true;
      component.loading = false;

      component.onClick(new Event('click'));

      expect(component.action.emit).not.toHaveBeenCalled();
    });

    it('should not emit action event when loading', () => {
      component.disabled = false;
      component.loading = true;

      component.onClick(new Event('click'));

      expect(component.action.emit).not.toHaveBeenCalled();
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      component.label = 'Test Button';
      fixture.detectChanges();
    });

    it('should render button element', () => {
      expect(buttonElement).toBeTruthy();
    });

    it('should display label on larger screens', () => {
      const desktopLabel = fixture.debugElement.query(By.css('.hidden.sm\\:inline'));
      expect(desktopLabel.nativeElement.textContent.trim()).toBe('Test Button');
    });

    it('should display short label on mobile when provided', () => {
      component.shortLabel = 'Short';
      fixture.detectChanges();

      const mobileLabel = fixture.debugElement.query(By.css('.sm\\:hidden'));
      expect(mobileLabel.nativeElement.textContent.trim()).toBe('Short');
    });

    it('should use full label on mobile when no short label provided', () => {
      const mobileLabel = fixture.debugElement.query(By.css('.sm\\:hidden'));
      expect(mobileLabel.nativeElement.textContent.trim()).toBe('Test Button');
    });

    it('should render icon when provided', () => {
      component.icon = '/test-icon.svg';
      fixture.detectChanges();

      const iconElement = fixture.debugElement.query(By.css('img'));
      expect(iconElement).toBeTruthy();
      expect(iconElement.nativeElement.src).toContain('/test-icon.svg');
      expect(iconElement.nativeElement.alt).toBe('Test Button');
    });

    it('should not render icon when loading', () => {
      component.icon = '/test-icon.svg';
      component.loading = true;
      fixture.detectChanges();

      const iconElement = fixture.debugElement.query(By.css('img'));
      expect(iconElement).toBeFalsy();
    });

    it('should render loading spinner when loading', () => {
      component.loading = true;
      fixture.detectChanges();

      const spinnerElement = fixture.debugElement.query(By.css('.animate-spin'));
      expect(spinnerElement).toBeTruthy();
    });

    it('should disable button when disabled', () => {
      component.disabled = true;
      fixture.detectChanges();

      expect(buttonElement.nativeElement.disabled).toBe(true);
    });

    it('should disable button when loading', () => {
      component.loading = true;
      fixture.detectChanges();

      expect(buttonElement.nativeElement.disabled).toBe(true);
    });

    it('should apply button classes', () => {
      const classes = buttonElement.nativeElement.className;
      expect(classes).toContain('flex');
      expect(classes).toContain('items-center');
      expect(classes).toContain('justify-center');
    });
  });


  describe('Integration Tests', () => {
    it('should handle complete button configuration', () => {
      component.label = 'Complete Button';
      component.shortLabel = 'Complete';
      component.icon = '/icon.svg';
      component.bgClass = 'bg-blue-500';
      component.textColor = 'text-white';
      component.hoverClass = 'hover:bg-blue-600';
      component.extraClasses = 'custom-test-class';
      component.disabled = false;
      component.loading = false;

      fixture.detectChanges();

      const classes = component.buttonClasses;
      expect(classes).toContain('bg-blue-500');
      expect(classes).toContain('text-white');
      expect(classes).toContain('hover:bg-blue-600');
      expect(classes).toContain('custom-test-class');
      expect(classes).toContain('cursor-pointer');
    });

    it('should handle loading state properly', () => {
      component.label = 'Loading Button';
      component.loading = true;
      component.icon = '/icon.svg';

      fixture.detectChanges();

      // Check that loading spinner is shown
      const spinner = fixture.debugElement.query(By.css('.animate-spin'));
      expect(spinner).toBeTruthy();

      // Check that icon is hidden during loading
      const icon = fixture.debugElement.query(By.css('img'));
      expect(icon).toBeFalsy();

      // Check that button is disabled
      expect(buttonElement.nativeElement.disabled).toBe(true);

      // Check that classes include disabled styling
      const classes = component.buttonClasses;
      expect(classes).toContain('opacity-50');
      expect(classes).toContain('cursor-not-allowed');
    });
  });
});
