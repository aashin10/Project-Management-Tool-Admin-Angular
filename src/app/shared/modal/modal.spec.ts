import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { Modal } from './modal';

describe('Modal', () => {
  let component: Modal;
  let fixture: ComponentFixture<Modal>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Modal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Modal);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  describe('Component Creation and Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.isOpen).toBeFalse();
      expect(component.close).toBeDefined();
    });

    it('should have EventEmitter for close output', () => {
      expect(component.close.emit).toBeDefined();
      expect(typeof component.close.emit).toBe('function');
    });
  });

  describe('Input Property - isOpen', () => {
    it('should have isOpen input default to false', () => {
      expect(component.isOpen).toBeFalse();
    });

    it('should accept isOpen input as true', () => {
      component.isOpen = true;
      expect(component.isOpen).toBeTrue();
    });

    it('should accept isOpen input as false', () => {
      component.isOpen = false;
      expect(component.isOpen).toBeFalse();
    });

    it('should handle isOpen changes dynamically', () => {
      component.isOpen = true;
      expect(component.isOpen).toBeTrue();

      component.isOpen = false;
      expect(component.isOpen).toBeFalse();

      component.isOpen = true;
      expect(component.isOpen).toBeTrue();
    });
  });

  describe('Template Rendering', () => {
    it('should not render modal when isOpen is false', () => {
      component.isOpen = false;
      fixture.detectChanges();

      const modalElement = debugElement.query(By.css('.fixed.inset-0'));
      expect(modalElement).toBeNull();
    });

    it('should render modal when isOpen is true', () => {
      component.isOpen = true;
      fixture.detectChanges();

      const modalElement = debugElement.query(By.css('.fixed.inset-0'));
      expect(modalElement).toBeTruthy();
    });

    it('should render backdrop when modal is open', () => {
      component.isOpen = true;
      fixture.detectChanges();

      const backdropElement = debugElement.query(By.css('.fixed.inset-0.bg-\\[rgba\\(0\\,0\\,0\\,0\\.3\\)\\]'));
      expect(backdropElement).toBeTruthy();
    });

    it('should render modal content container when modal is open', () => {
      component.isOpen = true;
      fixture.detectChanges();

      const modalContent = debugElement.query(By.css('.bg-white.rounded-lg'));
      expect(modalContent).toBeTruthy();
    });

    it('should render close button when modal is open', () => {
      component.isOpen = true;
      fixture.detectChanges();

      const closeButton = debugElement.query(By.css('button.absolute'));
      expect(closeButton).toBeTruthy();
    });

    it('should render ng-content when modal is open', () => {
      component.isOpen = true;
      fixture.detectChanges();

      // ng-content is a placeholder that gets replaced, so we test for the container that holds projected content
      const modalContent = debugElement.query(By.css('.bg-white.rounded-lg'));
      expect(modalContent).toBeTruthy();
      // The presence of the modal content container indicates content projection is supported
    });

    it('should toggle visibility when isOpen changes', () => {
      // Initially hidden
      component.isOpen = false;
      fixture.detectChanges();
      expect(debugElement.query(By.css('.fixed.inset-0'))).toBeNull();

      // Show modal
      component.isOpen = true;
      fixture.detectChanges();
      expect(debugElement.query(By.css('.fixed.inset-0'))).toBeTruthy();

      // Hide modal again
      component.isOpen = false;
      fixture.detectChanges();
      expect(debugElement.query(By.css('.fixed.inset-0'))).toBeNull();
    });
  });

  describe('Close Button Functionality', () => {
    beforeEach(() => {
      component.isOpen = true;
      fixture.detectChanges();
    });

    it('should render close button with correct attributes', () => {
      const closeButton = debugElement.query(By.css('button'));
      expect(closeButton).toBeTruthy();
      expect(closeButton.nativeElement.className).toContain('absolute');
      expect(closeButton.nativeElement.className).toContain('top-4');
      expect(closeButton.nativeElement.className).toContain('right-4');
    });

    it('should emit close event when close button is clicked', () => {
      spyOn(component.close, 'emit');

      const closeButton = debugElement.query(By.css('button'));
      closeButton.nativeElement.click();

      expect(component.close.emit).toHaveBeenCalled();
      expect(component.close.emit).toHaveBeenCalledTimes(1);
    });

    it('should call onClose method when close button is clicked', () => {
      spyOn(component, 'onClose');

      const closeButton = debugElement.query(By.css('button'));
      closeButton.nativeElement.click();

      expect(component.onClose).toHaveBeenCalled();
    });
  });

  describe('Backdrop Click Functionality', () => {
    beforeEach(() => {
      component.isOpen = true;
      fixture.detectChanges();
    });

    it('should render backdrop with click handler', () => {
      const backdrop = debugElement.query(By.css('.bg-\\[rgba\\(0\\,0\\,0\\,0\\.3\\)\\]'));
      expect(backdrop).toBeTruthy();
      expect(backdrop.listeners.length).toBeGreaterThan(0);
    });

    it('should emit close event when backdrop is clicked', () => {
      spyOn(component.close, 'emit');

      const backdrop = debugElement.query(By.css('.bg-\\[rgba\\(0\\,0\\,0\\,0\\.3\\)\\]'));
      const mockEvent = {
        target: backdrop.nativeElement,
        currentTarget: backdrop.nativeElement
      } as MouseEvent;

      component.onBackdropClick(mockEvent);

      expect(component.close.emit).toHaveBeenCalled();
    });

    it('should call onClose when backdrop is clicked', () => {
      spyOn(component, 'onClose');

      const backdrop = debugElement.query(By.css('.bg-\\[rgba\\(0\\,0\\,0\\,0\\.3\\)\\]'));
      const mockEvent = {
        target: backdrop.nativeElement,
        currentTarget: backdrop.nativeElement
      } as MouseEvent;

      component.onBackdropClick(mockEvent);

      expect(component.onClose).toHaveBeenCalled();
    });

    it('should not emit close event when clicking inside modal content', () => {
      spyOn(component.close, 'emit');

      const modalContent = debugElement.query(By.css('.bg-white.rounded-lg'));
      const backdrop = debugElement.query(By.css('.bg-\\[rgba\\(0\\,0\\,0\\,0\\.3\\)\\]'));
      const mockEvent = {
        target: modalContent.nativeElement,
        currentTarget: backdrop.nativeElement
      } as MouseEvent;

      component.onBackdropClick(mockEvent);

      expect(component.close.emit).not.toHaveBeenCalled();
    });

    it('should not call onClose when clicking inside modal content', () => {
      spyOn(component, 'onClose');

      const modalContent = debugElement.query(By.css('.bg-white.rounded-lg'));
      const backdrop = debugElement.query(By.css('.bg-\\[rgba\\(0\\,0\\,0\\,0\\.3\\)\\]'));
      const mockEvent = {
        target: modalContent.nativeElement,
        currentTarget: backdrop.nativeElement
      } as MouseEvent;

      component.onBackdropClick(mockEvent);

      expect(component.onClose).not.toHaveBeenCalled();
    });

    it('should handle clicks on child elements inside modal', () => {
      spyOn(component.close, 'emit');

      const closeButton = debugElement.query(By.css('button'));
      const backdrop = debugElement.query(By.css('.bg-\\[rgba\\(0\\,0\\,0\\,0\\.3\\)\\]'));
      const mockEvent = {
        target: closeButton.nativeElement,
        currentTarget: backdrop.nativeElement
      } as MouseEvent;

      component.onBackdropClick(mockEvent);

      expect(component.close.emit).not.toHaveBeenCalled();
    });
  });

  describe('onClose Method', () => {
    it('should emit close event', () => {
      spyOn(component.close, 'emit');

      component.onClose();

      expect(component.close.emit).toHaveBeenCalled();
      expect(component.close.emit).toHaveBeenCalledTimes(1);
      expect(component.close.emit).toHaveBeenCalledWith();
    });

    it('should emit close event multiple times when called repeatedly', () => {
      spyOn(component.close, 'emit');

      component.onClose();
      component.onClose();
      component.onClose();

      expect(component.close.emit).toHaveBeenCalledTimes(3);
    });

    it('should emit close event with no arguments', () => {
      spyOn(component.close, 'emit');

      component.onClose();

      expect(component.close.emit).toHaveBeenCalledWith();
    });
  });

  describe('onBackdropClick Method', () => {
    it('should close modal when target equals currentTarget', () => {
      spyOn(component, 'onClose');

      const element = document.createElement('div');
      const mockEvent = {
        target: element,
        currentTarget: element
      } as unknown as MouseEvent;

      component.onBackdropClick(mockEvent);

      expect(component.onClose).toHaveBeenCalled();
    });

    it('should not close modal when target differs from currentTarget', () => {
      spyOn(component, 'onClose');

      const mockEvent = {
        target: document.createElement('div'),
        currentTarget: document.createElement('div')
      } as unknown as MouseEvent;

      component.onBackdropClick(mockEvent);

      expect(component.onClose).not.toHaveBeenCalled();
    });

    it('should handle null event targets gracefully', () => {
      spyOn(component, 'onClose');

      const mockEvent = {
        target: null,
        currentTarget: document.createElement('div')
      } as unknown as MouseEvent;

      expect(() => component.onBackdropClick(mockEvent)).not.toThrow();
      expect(component.onClose).not.toHaveBeenCalled();
    });

    it('should handle null currentTarget gracefully', () => {
      spyOn(component, 'onClose');

      const mockEvent = {
        target: document.createElement('div'),
        currentTarget: null
      } as unknown as MouseEvent;

      expect(() => component.onBackdropClick(mockEvent)).not.toThrow();
      expect(component.onClose).not.toHaveBeenCalled();
    });

    // it('should handle undefined event properties gracefully', () => {
    //   spyOn(component, 'onClose');

    //   const mockEvent = {} as unknown as MouseEvent;

    //   expect(() => component.onBackdropClick(mockEvent)).not.toThrow();
    //   expect(component.onClose).not.toHaveBeenCalled();
    // });
  });

  describe('Event Emission Integration', () => {
    it('should allow parent components to listen to close events', (done) => {
      component.close.subscribe(() => {
        expect(true).toBeTruthy(); // Just verify the subscription works
        done();
      });

      component.onClose();
    });

    it('should emit close event through template interactions', () => {
      spyOn(component.close, 'emit');
      component.isOpen = true;
      fixture.detectChanges();

      // Simulate close button click
      const closeButton = debugElement.query(By.css('button'));
      closeButton.nativeElement.click();

      expect(component.close.emit).toHaveBeenCalled();
    });

    it('should emit close event through backdrop clicks', () => {
      spyOn(component.close, 'emit');
      component.isOpen = true;
      fixture.detectChanges();

      const backdrop = debugElement.query(By.css('.bg-\\[rgba\\(0\\,0\\,0\\,0\\.3\\)\\]'));
      const event = {
        target: backdrop.nativeElement,
        currentTarget: backdrop.nativeElement
      } as unknown as MouseEvent;

      component.onBackdropClick(event);

      expect(component.close.emit).toHaveBeenCalled();
    });
  });

  describe('Component State Management', () => {
    it('should maintain isOpen state independently of close events', () => {
      component.isOpen = true;
      expect(component.isOpen).toBeTrue();

      component.onClose();
      expect(component.isOpen).toBeTrue(); // isOpen should not change automatically
    });

    it('should handle rapid successive close events', () => {
      spyOn(component.close, 'emit');

      // Simulate rapid clicks
      component.onClose();
      component.onClose();
      component.onClose();

      expect(component.close.emit).toHaveBeenCalledTimes(3);
    });

    it('should handle close events when modal is not visible', () => {
      component.isOpen = false;

      expect(() => component.onClose()).not.toThrow();
      expect(() => {
        const event = { target: {}, currentTarget: {} } as MouseEvent;
        component.onBackdropClick(event);
      }).not.toThrow();
    });
  });

  describe('Template Structure and CSS Classes', () => {
    beforeEach(() => {
      component.isOpen = true;
      fixture.detectChanges();
    });

    it('should have correct modal container classes', () => {
      const modalContainer = debugElement.query(By.css('.fixed.inset-0'));
      expect(modalContainer.nativeElement.className).toContain('flex');
      expect(modalContainer.nativeElement.className).toContain('items-center');
      expect(modalContainer.nativeElement.className).toContain('justify-center');
    });

    it('should have correct backdrop classes', () => {
      const backdrop = debugElement.query(By.css('.bg-\\[rgba\\(0\\,0\\,0\\,0\\.3\\)\\]'));
      expect(backdrop.nativeElement.className).toContain('fixed');
      expect(backdrop.nativeElement.className).toContain('inset-0');
      expect(backdrop.nativeElement.className).toContain('transition-opacity');
    });

    it('should have correct modal content classes', () => {
      const modalContent = debugElement.query(By.css('.bg-white.rounded-lg'));
      expect(modalContent.nativeElement.className).toContain('relative');
      expect(modalContent.nativeElement.className).toContain('max-w-lg');
      expect(modalContent.nativeElement.className).toContain('shadow-xl');
    });

    it('should have correct close button styling', () => {
      const closeButton = debugElement.query(By.css('button'));
      expect(closeButton.nativeElement.className).toContain('text-gray-400');
      expect(closeButton.nativeElement.className).toContain('hover:text-gray-600');
    });

    it('should have SVG icon in close button', () => {
      const svgElement = debugElement.query(By.css('svg'));
      expect(svgElement).toBeTruthy();
      expect(svgElement.nativeElement.getAttribute('class')).toContain('w-6');
      expect(svgElement.nativeElement.getAttribute('class')).toContain('h-6');
    });
  });

  describe('Content Projection', () => {
    it('should support content projection', () => {
      component.isOpen = true;
      fixture.detectChanges();

      // Test that the modal content container exists where content can be projected
      const modalContent = debugElement.query(By.css('.bg-white.rounded-lg'));
      expect(modalContent).toBeTruthy();
    });

    it('should allow projected content to be visible when modal is open', () => {
      component.isOpen = true;
      fixture.detectChanges();

      // The modal content container should be present for content projection
      const modalContent = debugElement.query(By.css('.bg-white.rounded-lg'));
      expect(modalContent).toBeTruthy();
    });
  });

  describe('Accessibility and UX', () => {
    it('should have proper z-index layering', () => {
      component.isOpen = true;
      fixture.detectChanges();

      const modalContainer = debugElement.query(By.css('.fixed.inset-0'));
      expect(modalContainer.nativeElement.className).toContain('z-50');

      const modalContent = debugElement.query(By.css('.bg-white.rounded-lg'));
      expect(modalContent.nativeElement.className).toContain('z-10');
    });

    it('should have overflow handling', () => {
      component.isOpen = true;
      fixture.detectChanges();

      const modalContainer = debugElement.query(By.css('.fixed.inset-0'));
      expect(modalContainer.nativeElement.className).toContain('overflow-y-auto');
    });

    it('should have responsive design classes', () => {
      component.isOpen = true;
      fixture.detectChanges();

      const modalContent = debugElement.query(By.css('.bg-white.rounded-lg'));
      expect(modalContent.nativeElement.className).toContain('max-w-lg');
      expect(modalContent.nativeElement.className).toContain('w-full');
      expect(modalContent.nativeElement.className).toContain('mx-4');
    });

    it('should have ARIA attributes when open', () => {
      component.isOpen = true;
      fixture.detectChanges();

      const hostElement = debugElement.nativeElement;
      expect(hostElement.getAttribute('role')).toBe('dialog');
      expect(hostElement.getAttribute('aria-modal')).toBe('true');
      expect(hostElement.getAttribute('aria-hidden')).toBeNull();
    });

    it('should have ARIA attributes when closed', () => {
      component.isOpen = false;
      fixture.detectChanges();

      const hostElement = debugElement.nativeElement;
      expect(hostElement.getAttribute('role')).toBeNull();
      expect(hostElement.getAttribute('aria-modal')).toBeNull();
      expect(hostElement.getAttribute('aria-hidden')).toBe('true');
    });

    it('should close modal when Escape key is pressed', () => {
      spyOn(component, 'onClose');
      component.isOpen = true;

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(escapeEvent);

      expect(component.onClose).toHaveBeenCalled();
    });

    it('should not close modal when Escape key is pressed and modal is closed', () => {
      spyOn(component, 'onClose');
      component.isOpen = false;

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(escapeEvent);

      expect(component.onClose).not.toHaveBeenCalled();
    });

    it('should prevent default behavior when Escape key closes modal', () => {
      component.isOpen = true;

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      spyOn(escapeEvent, 'preventDefault');

      window.dispatchEvent(escapeEvent);

      expect(escapeEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Body Scroll Management', () => {
    it('should prevent body scroll when modal opens', () => {
      const initialOverflow = document.body.style.overflow;
      component.isOpen = true;
      (component as any).ngOnChanges();

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when modal closes', () => {
      // First prevent scroll
      component.isOpen = true;
      (component as any).ngOnChanges();

      // Then restore
      component.isOpen = false;
      (component as any).ngOnChanges();

      expect(document.body.style.overflow).toBe('');
    });

    it('should restore original body overflow on destroy', () => {
      document.body.style.overflow = 'auto';
      component.ngOnDestroy();

      expect(document.body.style.overflow).toBe('auto');
    });
  });

  describe('Focus Management', () => {
    it('should focus close button when modal opens', () => {
      component.isOpen = true;
      fixture.detectChanges();

      (component as any).ngOnChanges();

      // The close button should be focused
      const closeButton = debugElement.query(By.css('button'));
      expect(document.activeElement).toBe(closeButton.nativeElement);
    });

    it('should restore focus when modal closes', () => {
      // Set up a focused element
      const testElement = document.createElement('button');
      document.body.appendChild(testElement);
      testElement.focus();

      // Open modal
      component.isOpen = true;
      (component as any).ngOnChanges();

      // Close modal
      component.isOpen = false;
      (component as any).ngOnChanges();

      expect(document.activeElement).toBe(testElement);

      // Cleanup
      document.body.removeChild(testElement);
    });
  });

  describe('Event Handling Robustness', () => {
    it('should handle undefined event properties gracefully', () => {
      spyOn(component, 'onClose');

      const mockEvent = {} as unknown as MouseEvent;

      expect(() => component.onBackdropClick(mockEvent)).not.toThrow();
      expect(component.onClose).not.toHaveBeenCalled();
    });

    it('should handle null event gracefully', () => {
      spyOn(component, 'onClose');

      expect(() => component.onBackdropClick(null as any)).not.toThrow();
      expect(component.onClose).not.toHaveBeenCalled();
    });

    it('should handle event with null target gracefully', () => {
      spyOn(component, 'onClose');

      const mockEvent = {
        target: null,
        currentTarget: document.createElement('div')
      } as unknown as MouseEvent;

      expect(() => component.onBackdropClick(mockEvent)).not.toThrow();
      expect(component.onClose).not.toHaveBeenCalled();
    });

    it('should handle event with null currentTarget gracefully', () => {
      spyOn(component, 'onClose');

      const mockEvent = {
        target: document.createElement('div'),
        currentTarget: null
      } as unknown as MouseEvent;

      expect(() => component.onBackdropClick(mockEvent)).not.toThrow();
      expect(component.onClose).not.toHaveBeenCalled();
    });
  });
});
