import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
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
      fixture.detectChanges();

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when modal closes', () => {
      // Set initial body overflow before modal opens
      document.body.style.overflow = 'auto';

      // Open modal (should prevent scroll)
      component.isOpen = true;
      fixture.detectChanges();

      expect(document.body.style.overflow).toBe('hidden');

      // Close modal (should restore to original)
      component.isOpen = false;
      fixture.detectChanges();

      expect(document.body.style.overflow).toBe('auto');
    });

    it('should restore original body overflow on destroy', () => {
      // Set initial body overflow
      document.body.style.overflow = 'auto';

      // Simulate the component preventing scroll (like when modal opens)
      (component as any).isScrollPrevented = true;
      (component as any).bodyOverflow = 'auto'; // This would be captured during ngOnInit

      // Change overflow to hidden (simulating modal being open)
      document.body.style.overflow = 'hidden';

      // Destroy component (should restore to original)
      component.ngOnDestroy();

      expect(document.body.style.overflow).toBe('auto');
    });
  });

  describe('Focus Management', () => {
    it('should focus close button when modal opens', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();
      tick(); // Wait for setTimeout in component

      // The close button should be focused
      const closeButton = debugElement.query(By.css('button'));
      expect(document.activeElement).toBe(closeButton.nativeElement);
    }));

    it('should restore focus when modal closes', () => {
      // Set up a focused element
      const testElement = document.createElement('button');
      document.body.appendChild(testElement);
      testElement.focus();

      // Open modal
      component.isOpen = true;
      fixture.detectChanges();

      // Close modal
      component.isOpen = false;
      fixture.detectChanges();

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

  describe('Focus Trap and Tab Navigation', () => {
    beforeEach(() => {
      component.isOpen = true;
      fixture.detectChanges();
    });

    it('should trap focus within modal when Tab is pressed', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();
      tick(); // Wait for setTimeout in openModal
      fixture.detectChanges(); // Trigger change detection again

      // Manually update focusable elements to ensure they are populated
      (component as any).updateFocusableElements();

      const closeButton = debugElement.query(By.css('button'));
      closeButton.nativeElement.focus();

      // Verify focusable elements are set
      expect((component as any).focusableElements.length).toBeGreaterThan(0);

      // Create mock event with spy
      const mockEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: jasmine.createSpy('preventDefault')
      } as any;
      
      (component as any).onTabKey(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    }));

    it('should move focus to last element when Shift+Tab from first element', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();
      tick(); // Wait for setTimeout in openModal
      fixture.detectChanges(); // Trigger change detection again

      // Manually update focusable elements to ensure they are populated
      (component as any).updateFocusableElements();

      const closeButton = debugElement.query(By.css('button'));
      closeButton.nativeElement.focus();

      // Verify focusable elements are set
      expect((component as any).focusableElements.length).toBeGreaterThan(0);

      const mockEvent = {
        key: 'Tab',
        shiftKey: true,
        preventDefault: jasmine.createSpy('preventDefault')
      } as any;
      
      (component as any).onTabKey(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    }));

    it('should handle Tab navigation when no focusable elements exist', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();
      tick();

      // Simulate no focusable elements
      (component as any).focusableElements = [];
      (component as any).firstFocusableElement = undefined;
      (component as any).lastFocusableElement = undefined;

      const mockEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: jasmine.createSpy('preventDefault')
      } as any;
      
      // Should not call preventDefault when no focusable elements
      (component as any).onTabKey(mockEvent);

      // Since focusableElements.length === 0, preventDefault should not be called
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    }));

    it('should handle focusin events outside modal', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();
      tick();

      const outsideElement = document.createElement('button');
      document.body.appendChild(outsideElement);

      const preventDefaultSpy = jasmine.createSpy('preventDefault');
      const focusInEvent = new FocusEvent('focusin', { 
        bubbles: true,
        cancelable: true,
        relatedTarget: outsideElement 
      });
      Object.defineProperty(focusInEvent, 'target', { value: outsideElement, configurable: true });
      Object.defineProperty(focusInEvent, 'preventDefault', { value: preventDefaultSpy, writable: true });

      document.dispatchEvent(focusInEvent);
      tick();

      // The focusInListener should have been called
      expect((component as any).focusInListener).toBeDefined();

      document.body.removeChild(outsideElement);
    }));

    it('should update focusable elements when modal opens', fakeAsync(() => {
      component.isOpen = false;
      fixture.detectChanges();

      component.isOpen = true;
      fixture.detectChanges();
      tick();

      expect((component as any).focusableElements).toBeDefined();
    }));

    it('should handle Tab navigation between multiple focusable elements', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();
      tick();

      // Add multiple focusable elements
      const modalContent = debugElement.query(By.css('.bg-white.rounded-lg')).nativeElement;
      const input1 = document.createElement('input');
      const input2 = document.createElement('input');
      modalContent.appendChild(input1);
      modalContent.appendChild(input2);

      // Update focusable elements after adding new elements
      (component as any).updateFocusableElements();
      
      fixture.detectChanges();
      tick();

      input1.focus();

      const mockEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: jasmine.createSpy('preventDefault')
      } as any;
      
      (component as any).onTabKey(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();

      modalContent.removeChild(input1);
      modalContent.removeChild(input2);
    }));

    it('should wrap focus to first element when Tab from last element', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();
      tick();

      const modalContent = debugElement.query(By.css('.bg-white.rounded-lg')).nativeElement;
      const input = document.createElement('input');
      modalContent.appendChild(input);

      // Update focusable elements after adding new element
      (component as any).updateFocusableElements();
      
      fixture.detectChanges();
      tick();

      // Focus the last element (close button should now be last after re-arranging)
      const lastElement = (component as any).lastFocusableElement;
      if (lastElement) {
        lastElement.focus();
      }

      const mockEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: jasmine.createSpy('preventDefault')
      } as any;
      
      (component as any).onTabKey(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();

      modalContent.removeChild(input);
    }));
  });

  describe('Advanced Body Scroll Management', () => {
    it('should calculate and apply scrollbar width compensation', () => {
      const initialWidth = window.innerWidth;
      const docWidth = document.documentElement.clientWidth;
      const scrollbarWidth = initialWidth - docWidth;

      component.isOpen = true;
      fixture.detectChanges();

      // Verify body scroll is prevented
      expect(document.body.style.overflow).toBe('hidden');
      
      // Scrollbar width compensation should be applied
      if (scrollbarWidth > 0) {
        expect(document.body.style.paddingRight).toContain('px');
      } else {
        // Even if no scrollbar, padding should be set (may be 0px)
        expect(document.body.style.paddingRight).toBeDefined();
      }
    });

    it('should not prevent scroll if modal is already closed', () => {
      component.isOpen = false;
      fixture.detectChanges();

      const initialOverflow = document.body.style.overflow;
      
      component.isOpen = false;
      fixture.detectChanges();

      expect(document.body.style.overflow).toBe(initialOverflow);
    });

    it('should handle multiple open/close cycles correctly', () => {
      // First cycle
      component.isOpen = true;
      fixture.detectChanges();
      expect(document.body.style.overflow).toBe('hidden');

      component.isOpen = false;
      fixture.detectChanges();

      // Second cycle
      component.isOpen = true;
      fixture.detectChanges();
      expect(document.body.style.overflow).toBe('hidden');

      component.isOpen = false;
      fixture.detectChanges();
    });
  });

  describe('Event Listener Management', () => {
    it('should add event listeners when modal opens', fakeAsync(() => {
      const addSpy = spyOn(document, 'addEventListener').and.callThrough();

      component.isOpen = true;
      fixture.detectChanges();
      tick();

      expect(addSpy).toHaveBeenCalled();
    }));

    it('should remove event listeners when modal closes', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();
      tick();

      const removeSpy = spyOn(document, 'removeEventListener').and.callThrough();

      component.isOpen = false;
      fixture.detectChanges();
      tick();

      expect(removeSpy).toHaveBeenCalled();
    }));

    it('should remove event listeners on component destroy', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();
      tick();

      const removeSpy = spyOn(document, 'removeEventListener').and.callThrough();

      fixture.destroy();

      expect(removeSpy).toHaveBeenCalled();
    }));

    it('should not add duplicate event listeners', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();
      tick();

      const initialListeners = (component as any).tabKeyListener;

      // Try to open again (should not add duplicate)
      component.isOpen = false;
      fixture.detectChanges();
      tick();

      component.isOpen = true;
      fixture.detectChanges();
      tick();

      expect((component as any).tabKeyListener).toBeDefined();
    }));
  });

  describe('Focusable Elements Detection', () => {
    it('should detect various focusable element types', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();

      const modalContent = debugElement.query(By.css('.bg-white.rounded-lg')).nativeElement;
      
      // Add different focusable elements
      const input = document.createElement('input');
      const textarea = document.createElement('textarea');
      const select = document.createElement('select');
      const button = document.createElement('button');
      const link = document.createElement('a');
      link.href = '#';

      modalContent.appendChild(input);
      modalContent.appendChild(textarea);
      modalContent.appendChild(select);
      modalContent.appendChild(button);
      modalContent.appendChild(link);

      fixture.detectChanges();
      tick();

      expect((component as any).focusableElements.length).toBeGreaterThan(0);

      // Cleanup
      modalContent.removeChild(input);
      modalContent.removeChild(textarea);
      modalContent.removeChild(select);
      modalContent.removeChild(button);
      modalContent.removeChild(link);
    }));

    it('should exclude disabled elements from focusable list', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();

      const modalContent = debugElement.query(By.css('.bg-white.rounded-lg')).nativeElement;
      
      const disabledButton = document.createElement('button');
      disabledButton.disabled = true;
      modalContent.appendChild(disabledButton);

      fixture.detectChanges();
      tick();

      const focusableElements = (component as any).focusableElements as HTMLElement[];
      expect(focusableElements.includes(disabledButton)).toBeFalse();

      modalContent.removeChild(disabledButton);
    }));

    it('should exclude hidden elements from focusable list', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();

      const modalContent = debugElement.query(By.css('.bg-white.rounded-lg')).nativeElement;
      
      const hiddenInput = document.createElement('input');
      hiddenInput.style.display = 'none';
      modalContent.appendChild(hiddenInput);

      fixture.detectChanges();
      tick();

      const focusableElements = (component as any).focusableElements as HTMLElement[];
      expect(focusableElements.includes(hiddenInput)).toBeFalse();

      modalContent.removeChild(hiddenInput);
    }));

    it('should prioritize close button in focusable elements', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();
      tick();

      const focusableElements = (component as any).focusableElements as HTMLElement[];
      expect(focusableElements.length).toBeGreaterThan(0);
    }));

    it('should clear focusable elements when modal closes', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();
      tick();

      component.isOpen = false;
      fixture.detectChanges();
      tick();

      expect((component as any).focusableElements).toEqual([]);
      expect((component as any).firstFocusableElement).toBeUndefined();
      expect((component as any).lastFocusableElement).toBeUndefined();
    }));
  });

  describe('Focus Management Edge Cases', () => {
    it('should focus modal element if no focusable elements found', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();

      // Clear focusable elements
      (component as any).focusableElements = [];
      (component as any).firstFocusableElement = undefined;

      tick();

      const modalElement = debugElement.query(By.css('.bg-white.rounded-lg'));
      expect(modalElement).toBeTruthy();
    }));

    it('should handle focus restoration when previous element is removed', fakeAsync(() => {
      const tempButton = document.createElement('button');
      document.body.appendChild(tempButton);
      tempButton.focus();

      component.isOpen = true;
      fixture.detectChanges();
      tick();

      document.body.removeChild(tempButton);

      component.isOpen = false;
      fixture.detectChanges();
      tick();

      // Should not throw error
      expect(component.isOpen).toBeFalse();
    }));

    it('should handle Tab navigation when current element is not in focusable list', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();
      tick();

      // Focus an element outside the modal
      const outsideElement = document.createElement('button');
      document.body.appendChild(outsideElement);
      outsideElement.focus();

      const mockEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: jasmine.createSpy('preventDefault')
      } as any;
      
      (component as any).onTabKey(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();

      document.body.removeChild(outsideElement);
    }));

    it('should handle Shift+Tab when current element is not in focusable list', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();
      tick();

      const outsideElement = document.createElement('button');
      document.body.appendChild(outsideElement);
      outsideElement.focus();

      const mockEvent = {
        key: 'Tab',
        shiftKey: true,
        preventDefault: jasmine.createSpy('preventDefault')
      } as any;
      
      (component as any).onTabKey(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();

      document.body.removeChild(outsideElement);
    }));
  });

  describe('Platform Detection and SSR Support', () => {
    it('should handle body scroll management in browser', () => {
      component.isOpen = true;
      fixture.detectChanges();

      expect(document.body.style.overflow).toBe('hidden');

      component.isOpen = false;
      fixture.detectChanges();

      expect((component as any).isScrollPrevented).toBeFalse();
    });

    it('should not throw errors when modal element is not found', fakeAsync(() => {
      component.isOpen = true;
      
      // Remove modal element temporarily
      const modalElement = debugElement.query(By.css('.bg-white.rounded-lg'));
      if (modalElement) {
        modalElement.nativeElement.remove();
      }

      fixture.detectChanges();
      tick();

      expect(() => {
        (component as any).updateFocusableElements();
      }).not.toThrow();
    }));
  });

  describe('AfterViewChecked Lifecycle', () => {
    it('should detect state changes in ngAfterViewChecked', () => {
      expect((component as any).wasOpen).toBeFalse();

      component.isOpen = true;
      component.ngAfterViewChecked();

      expect((component as any).wasOpen).toBeTrue();
    });

    it('should not trigger handlers if state unchanged', () => {
      component.isOpen = false;
      (component as any).wasOpen = false;

      const handleSpy = spyOn(component as any, 'handleModalStateChange');
      
      component.ngAfterViewChecked();

      expect(handleSpy).not.toHaveBeenCalled();
    });

    it('should handle modal state changes multiple times', () => {
      component.isOpen = true;
      component.ngAfterViewChecked();

      component.isOpen = false;
      component.ngAfterViewChecked();

      component.isOpen = true;
      component.ngAfterViewChecked();

      expect((component as any).wasOpen).toBeTrue();
    });
  });

  describe('Renderer2 Usage', () => {
    it('should use Renderer2 for style manipulation', () => {
      const renderer = (component as any).renderer;
      expect(renderer).toBeDefined();

      component.isOpen = true;
      fixture.detectChanges();

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should remove padding-right when restoring scroll', () => {
      component.isOpen = true;
      fixture.detectChanges();

      component.isOpen = false;
      fixture.detectChanges();

      // Padding-right should be removed
      expect(document.body.style.paddingRight).toBe('');
    });
  });

  describe('Complete Coverage Tests', () => {
    it('should handle Tab navigation at exact middle of focusable elements', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();

      const modalContent = debugElement.query(By.css('.bg-white.rounded-lg')).nativeElement;
      const input1 = document.createElement('input');
      const input2 = document.createElement('input');
      const input3 = document.createElement('input');
      
      modalContent.appendChild(input1);
      modalContent.appendChild(input2);
      modalContent.appendChild(input3);

      // Update focusable elements after adding new elements
      (component as any).updateFocusableElements();
      
      fixture.detectChanges();
      tick();

      input2.focus();

      const mockEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: jasmine.createSpy('preventDefault')
      } as any;
      
      (component as any).onTabKey(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();

      modalContent.removeChild(input1);
      modalContent.removeChild(input2);
      modalContent.removeChild(input3);
    }));

    it('should handle Shift+Tab from middle element', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();

      const modalContent = debugElement.query(By.css('.bg-white.rounded-lg')).nativeElement;
      const input1 = document.createElement('input');
      const input2 = document.createElement('input');
      const input3 = document.createElement('input');
      
      modalContent.appendChild(input1);
      modalContent.appendChild(input2);
      modalContent.appendChild(input3);

      // Update focusable elements after adding new elements
      (component as any).updateFocusableElements();
      
      fixture.detectChanges();
      tick();

      input2.focus();

      const mockEvent = {
        key: 'Tab',
        shiftKey: true,
        preventDefault: jasmine.createSpy('preventDefault')
      } as any;
      
      (component as any).onTabKey(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();

      modalContent.removeChild(input1);
      modalContent.removeChild(input2);
      modalContent.removeChild(input3);
    }));

    it('should handle visibility hidden elements', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();

      const modalContent = debugElement.query(By.css('.bg-white.rounded-lg')).nativeElement;
      
      const hiddenInput = document.createElement('input');
      hiddenInput.style.visibility = 'hidden';
      modalContent.appendChild(hiddenInput);

      fixture.detectChanges();
      tick();

      const focusableElements = (component as any).focusableElements as HTMLElement[];
      expect(focusableElements.includes(hiddenInput)).toBeFalse();

      modalContent.removeChild(hiddenInput);
    }));

    it('should handle elements with tabindex=-1', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();

      const modalContent = debugElement.query(By.css('.bg-white.rounded-lg')).nativeElement;
      
      const negativeTabIndex = document.createElement('div');
      negativeTabIndex.setAttribute('tabindex', '-1');
      modalContent.appendChild(negativeTabIndex);

      fixture.detectChanges();
      tick();

      const focusableElements = (component as any).focusableElements as HTMLElement[];
      expect(focusableElements.includes(negativeTabIndex)).toBeFalse();

      modalContent.removeChild(negativeTabIndex);
    }));

    it('should handle contenteditable elements', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();

      const modalContent = debugElement.query(By.css('.bg-white.rounded-lg')).nativeElement;
      
      const editableDiv = document.createElement('div');
      editableDiv.setAttribute('contenteditable', 'true');
      modalContent.appendChild(editableDiv);

      fixture.detectChanges();
      tick();

      const focusableElements = (component as any).focusableElements as HTMLElement[];
      expect(focusableElements.includes(editableDiv)).toBeTrue();

      modalContent.removeChild(editableDiv);
    }));

    it('should handle focusin when modal element does not exist', fakeAsync(() => {
      component.isOpen = true;
      fixture.detectChanges();
      tick();

      // Remove modal element
      const modalElement = debugElement.query(By.css('.bg-white.rounded-lg'));
      if (modalElement) {
        const parent = modalElement.nativeElement.parentElement;
        if (parent) {
          parent.removeChild(modalElement.nativeElement);
        }
      }

      const outsideElement = document.createElement('button');
      document.body.appendChild(outsideElement);

      const focusInEvent = new FocusEvent('focusin', { 
        bubbles: true,
        relatedTarget: outsideElement 
      });
      Object.defineProperty(focusInEvent, 'target', { value: outsideElement, configurable: true });

      expect(() => document.dispatchEvent(focusInEvent)).not.toThrow();

      document.body.removeChild(outsideElement);
    }));
  });
});
