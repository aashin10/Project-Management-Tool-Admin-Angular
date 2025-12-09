import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DashboardMetricCards } from './dashboard-metric-cards';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('DashboardMetricCards', () => {
  let component: DashboardMetricCards;
  let fixture: ComponentFixture<DashboardMetricCards>;
  let compiled: HTMLElement;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create mock router
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [DashboardMetricCards],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardMetricCards);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have standalone set to true', () => {
      const metadata = (DashboardMetricCards as any).ɵcmp;
      expect(metadata.standalone).toBe(true);
    });

    it('should inject Router', () => {
      expect(component['router']).toBeDefined();
    });
  });

  describe('Input Properties', () => {
    it('should have required title input', () => {
      component.title = 'Test Title';
      expect(component.title).toBe('Test Title');
    });

    it('should have required value input', () => {
      component.value = 42;
      expect(component.value).toBe(42);
    });

    it('should have required icon input', () => {
      component.icon = '/test-icon.svg';
      expect(component.icon).toBe('/test-icon.svg');
    });

    it('should have iconBgColor with default value', () => {
      expect(component.iconBgColor).toBe('bg-gray-50');
    });

    it('should allow iconBgColor override', () => {
      component.iconBgColor = 'bg-blue-50';
      expect(component.iconBgColor).toBe('bg-blue-50');
    });

    it('should have iconColor with default value', () => {
      expect(component.iconColor).toBe('text-gray-600');
    });

    it('should allow iconColor override', () => {
      component.iconColor = 'text-blue-600';
      expect(component.iconColor).toBe('text-blue-600');
    });

    it('should have borderColor with default value', () => {
      expect(component.borderColor).toBe('border-gray-200');
    });

    it('should allow borderColor override', () => {
      component.borderColor = 'border-blue-100';
      expect(component.borderColor).toBe('border-blue-100');
    });

    it('should have optional trend property', () => {
      expect(component.trend).toBeUndefined();
      component.trend = '+12%';
      expect(component.trend).toBe('+12%');
    });

    it('should have optional trendColor property', () => {
      expect(component.trendColor).toBeUndefined();
      component.trendColor = 'text-green-600';
      expect(component.trendColor).toBe('text-green-600');
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      component.title = 'Total Projects';
      component.value = 37;
      component.icon = '/test-icon.svg';
      component.borderColor = 'border-blue-100';
      fixture.detectChanges();
    });

    it('should render the card container with correct classes', () => {
      const card = compiled.querySelector('.bg-white.rounded-sm');
      expect(card).toBeTruthy();
      expect(card?.classList.contains('cursor-pointer')).toBe(true);
      expect(card?.classList.contains('group')).toBe(true);
    });

    it('should render the title', () => {
      const title = compiled.querySelector('h3');
      expect(title).toBeTruthy();
      expect(title?.textContent?.trim()).toBe('Total Projects');
    });

    it('should render the value', () => {
      const value = compiled.querySelector('p.text-4xl');
      expect(value).toBeTruthy();
      expect(value?.textContent?.trim()).toBe('37');
    });

    it('should render the icon with correct src', () => {
      const icon = compiled.querySelector('img') as HTMLImageElement;
      expect(icon).toBeTruthy();
      expect(icon.src).toContain('/test-icon.svg');
    });

    it('should render icon with correct alt text', () => {
      const icon = compiled.querySelector('img') as HTMLImageElement;
      expect(icon.getAttribute('alt')).toBe('icon');
    });

    it('should apply iconColor class to icon', () => {
      component.iconColor = 'text-blue-600';
      fixture.detectChanges();
      const icon = compiled.querySelector('img');
      expect(icon?.classList.contains('text-blue-600')).toBe(true);
    });

    it('should apply borderColor to card container', () => {
      const card = compiled.querySelector('.bg-white.rounded-sm');
      expect(card?.classList.contains('border-blue-100')).toBe(true);
    });

    it('should render with default borderColor when not provided', () => {
      component.borderColor = 'border-gray-200';
      fixture.detectChanges();
      const card = compiled.querySelector('.bg-white.rounded-sm');
      expect(card?.classList.contains('border-gray-200')).toBe(true);
    });

    it('should have hover and transition classes', () => {
      const card = compiled.querySelector('.bg-white');
      expect(card?.classList.contains('hover:shadow-lg')).toBe(true);
      expect(card?.classList.contains('transition-all')).toBe(true);
      expect(card?.classList.contains('duration-300')).toBe(true);
    });

    it('should have group-hover effect on value', () => {
      const value = compiled.querySelector('p.text-4xl');
      expect(value?.classList.contains('group-hover:text-blue-600')).toBe(true);
      expect(value?.classList.contains('transition-colors')).toBe(true);
    });
  });

  describe('handleCardClick Method', () => {
    beforeEach(() => {
      mockRouter.navigate.and.returnValue(Promise.resolve(true));
    });

    it('should navigate to /projects for Total Projects', () => {
      component.title = 'Total Projects';
      component.handleCardClick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/projects'],
        { queryParams: {} }
      );
    });

    it('should navigate to /projects with Active status for In Progress', () => {
      component.title = 'In Progress';
      component.handleCardClick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/projects'],
        { queryParams: { status: 'Active' } }
      );
    });

    it('should navigate to /projects with Inactive status for On Hold Projects', () => {
      component.title = 'On Hold Projects';
      component.handleCardClick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/projects'],
        { queryParams: { status: 'Inactive' } }
      );
    });

    it('should navigate to /deliveryunits for Delivery Units', () => {
      component.title = 'Delivery Units';
      component.handleCardClick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/deliveryunits'],
        { queryParams: {} }
      );
    });

    it('should not navigate for unknown card title', () => {
      component.title = 'Unknown Card';
      component.handleCardClick();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle empty title', () => {
      component.title = '';
      component.handleCardClick();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle null navigation gracefully', () => {
      component.title = 'Random Title';
      expect(() => component.handleCardClick()).not.toThrow();
    });
  });

  describe('Click Event Handling', () => {
    beforeEach(() => {
      component.title = 'Total Projects';
      component.value = 37;
      component.icon = '/test-icon.svg';
      fixture.detectChanges();
      mockRouter.navigate.and.returnValue(Promise.resolve(true));
    });

    it('should call handleCardClick when card is clicked', () => {
      spyOn(component, 'handleCardClick');
      const card = compiled.querySelector('.bg-white') as HTMLElement;
      card.click();

      expect(component.handleCardClick).toHaveBeenCalled();
    });

    it('should trigger navigation when card is clicked', () => {
      const card = compiled.querySelector('.bg-white') as HTMLElement;
      card.click();

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/projects'],
        { queryParams: {} }
      );
    });

    it('should be clickable with cursor-pointer class', () => {
      const card = compiled.querySelector('.bg-white');
      expect(card?.classList.contains('cursor-pointer')).toBe(true);
    });
  });

  describe('Navigation Map', () => {
    it('should have correct path for Total Projects', () => {
      component.title = 'Total Projects';
      component.handleCardClick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/projects'],
        jasmine.objectContaining({ queryParams: {} })
      );
    });

    it('should have correct queryParams for In Progress', () => {
      component.title = 'In Progress';
      component.handleCardClick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/projects'],
        jasmine.objectContaining({ queryParams: { status: 'Active' } })
      );
    });

    it('should have correct queryParams for On Hold Projects', () => {
      component.title = 'On Hold Projects';
      component.handleCardClick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/projects'],
        jasmine.objectContaining({ queryParams: { status: 'Inactive' } })
      );
    });

    it('should have correct path for Delivery Units', () => {
      component.title = 'Delivery Units';
      component.handleCardClick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/deliveryunits'],
        jasmine.objectContaining({ queryParams: {} })
      );
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very large values', () => {
      component.value = 999999;
      fixture.detectChanges();
      const value = compiled.querySelector('p.text-4xl');
      expect(value?.textContent?.trim()).toBe('999999');
    });

    it('should handle zero value', () => {
      component.value = 0;
      fixture.detectChanges();
      const value = compiled.querySelector('p.text-4xl');
      expect(value?.textContent?.trim()).toBe('0');
    });

    it('should handle negative values', () => {
      component.value = -5;
      fixture.detectChanges();
      const value = compiled.querySelector('p.text-4xl');
      expect(value?.textContent?.trim()).toBe('-5');
    });

    it('should handle very long title', () => {
      component.title = 'This is a very long title that should still render properly';
      fixture.detectChanges();
      const title = compiled.querySelector('h3');
      expect(title?.textContent?.trim()).toContain('This is a very long title');
    });

    it('should handle special characters in title', () => {
      component.title = 'Projects & Tasks - 100%';
      fixture.detectChanges();
      const title = compiled.querySelector('h3');
      expect(title?.textContent?.trim()).toBe('Projects & Tasks - 100%');
    });

    it('should handle multiple rapid clicks', () => {
      component.title = 'Total Projects';
      component.handleCardClick();
      component.handleCardClick();
      component.handleCardClick();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(3);
    });

    it('should handle navigation failure gracefully', () => {
      mockRouter.navigate.and.returnValue(Promise.reject('Navigation failed'));
      component.title = 'Total Projects';
      
      expect(() => component.handleCardClick()).not.toThrow();
    });
  });

  describe('Styling and CSS Classes', () => {
    beforeEach(() => {
      component.title = 'Test Card';
      component.value = 10;
      component.icon = '/icon.svg';
      fixture.detectChanges();
    });

    it('should have correct padding classes', () => {
      const card = compiled.querySelector('.bg-white');
      expect(card?.classList.contains('p-6')).toBe(true);
    });

    it('should have correct border radius', () => {
      const card = compiled.querySelector('.bg-white');
      expect(card?.classList.contains('rounded-sm')).toBe(true);
    });

    it('should have correct background color', () => {
      const card = compiled.querySelector('.bg-white');
      expect(card?.classList.contains('bg-white')).toBe(true);
    });

    it('should have correct text size for title', () => {
      const title = compiled.querySelector('h3');
      expect(title?.classList.contains('text-sm')).toBe(true);
      expect(title?.classList.contains('font-medium')).toBe(true);
    });

    it('should have correct text size for value', () => {
      const value = compiled.querySelector('p.text-4xl');
      expect(value?.classList.contains('text-4xl')).toBe(true);
      expect(value?.classList.contains('font-bold')).toBe(true);
    });

    it('should have correct icon size classes', () => {
      const icon = compiled.querySelector('img');
      expect(icon?.classList.contains('w-6')).toBe(true);
      expect(icon?.classList.contains('h-6')).toBe(true);
    });

    it('should apply custom borderColor class', () => {
      component.borderColor = 'border-red-500';
      fixture.detectChanges();
      const card = compiled.querySelector('.bg-white');
      expect(card?.classList.contains('border-red-500')).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should render complete card with all properties', () => {
      component.title = 'Total Projects';
      component.value = 37;
      component.icon = '/dashboard-card1.svg';
      component.iconBgColor = 'bg-blue-50';
      component.iconColor = 'text-blue-600';
      component.borderColor = 'border-blue-100';
      fixture.detectChanges();

      const card = compiled.querySelector('.bg-white');
      const title = compiled.querySelector('h3');
      const value = compiled.querySelector('p.text-4xl');
      const icon = compiled.querySelector('img') as HTMLImageElement;

      expect(card).toBeTruthy();
      expect(title?.textContent?.trim()).toBe('Total Projects');
      expect(value?.textContent?.trim()).toBe('37');
      expect(icon.src).toContain('/dashboard-card1.svg');
      expect(card?.classList.contains('border-blue-100')).toBe(true);
    });

    it('should update display when input values change', () => {
      component.title = 'Initial Title';
      component.value = 10;
      fixture.detectChanges();

      let title = compiled.querySelector('h3');
      let value = compiled.querySelector('p.text-4xl');
      expect(title?.textContent?.trim()).toBe('Initial Title');
      expect(value?.textContent?.trim()).toBe('10');

      component.title = 'Updated Title';
      component.value = 20;
      fixture.detectChanges();

      title = compiled.querySelector('h3');
      value = compiled.querySelector('p.text-4xl');
      expect(title?.textContent?.trim()).toBe('Updated Title');
      expect(value?.textContent?.trim()).toBe('20');
    });

    it('should maintain navigation behavior after property updates', () => {
      component.title = 'Total Projects';
      fixture.detectChanges();
      
      const card = compiled.querySelector('.bg-white') as HTMLElement;
      card.click();
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/projects'],
        { queryParams: {} }
      );

      mockRouter.navigate.calls.reset();

      component.title = 'In Progress';
      fixture.detectChanges();
      card.click();
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/projects'],
        { queryParams: { status: 'Active' } }
      );
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      component.title = 'Total Projects';
      component.value = 37;
      component.icon = '/icon.svg';
      fixture.detectChanges();
    });

    it('should have proper icon alt attribute', () => {
      const icon = compiled.querySelector('img');
      expect(icon?.getAttribute('alt')).toBe('icon');
    });

    it('should be keyboard accessible with click handler', () => {
      const card = compiled.querySelector('.bg-white') as HTMLElement;
      spyOn(component, 'handleCardClick');
      
      const clickEvent = new MouseEvent('click');
      card.dispatchEvent(clickEvent);
      
      expect(component.handleCardClick).toHaveBeenCalled();
    });

    it('should have visible cursor pointer for interactivity', () => {
      const card = compiled.querySelector('.bg-white');
      expect(card?.classList.contains('cursor-pointer')).toBe(true);
    });
  });
});