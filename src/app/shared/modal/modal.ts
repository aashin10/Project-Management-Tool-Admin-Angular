import { Component, Input, Output, EventEmitter, HostListener, ElementRef, OnInit, OnDestroy, AfterViewChecked, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
  host: {
    '[attr.aria-hidden]': 'isOpen ? null : "true"',
    '[attr.role]': 'isOpen ? "dialog" : null',
    '[attr.aria-modal]': 'isOpen ? "true" : null'
  }
})
export class Modal implements OnInit, OnDestroy, AfterViewChecked {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  private previousFocusElement?: HTMLElement;
  private bodyOverflow: string = '';
  private isScrollPrevented: boolean = false;
  private focusableElements: HTMLElement[] = [];
  private firstFocusableElement?: HTMLElement;
  private lastFocusableElement?: HTMLElement;
  private tabKeyListener?: (event: KeyboardEvent) => void;
  private focusInListener?: (event: FocusEvent) => void;
  private wasOpen: boolean = false;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Store initial body overflow (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      this.bodyOverflow = document.body.style.overflow || '';
    }
  }

  ngAfterViewChecked() {
    // Check if modal state changed
    if (this.wasOpen !== this.isOpen) {
      this.wasOpen = this.isOpen;
      this.handleModalStateChange();
    }
  }

  ngOnDestroy() {
    // Cleanup: restore body scroll
    this.restoreBodyScroll();

    // Remove all event listeners
    this.removeEventListeners();
  }

  private handleModalStateChange() {
    if (this.isOpen) {
      this.openModal();
    } else {
      this.closeModal();
    }
  }

  private openModal() {
    this.preventBodyScroll();
    this.addEventListeners();

    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(() => {
      this.updateFocusableElements();
      this.focusModal();
    }, 0);
  }

  private closeModal() {
    this.removeEventListeners();
    this.restoreBodyScroll();
    this.restoreFocus();
    this.clearFocusableElements();
  }

  private addEventListeners() {
    if (!isPlatformBrowser(this.platformId)) return;

    if (!this.tabKeyListener) {
      this.tabKeyListener = this.onTabKey.bind(this);
      document.addEventListener('keydown', this.tabKeyListener, true); // Use capture phase
    }

    if (!this.focusInListener) {
      this.focusInListener = this.onFocusIn.bind(this);
      document.addEventListener('focusin', this.focusInListener, true); // Use capture phase
    }
  }

  private removeEventListeners() {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.tabKeyListener) {
      document.removeEventListener('keydown', this.tabKeyListener, true);
      this.tabKeyListener = undefined;
    }

    if (this.focusInListener) {
      document.removeEventListener('focusin', this.focusInListener, true);
      this.focusInListener = undefined;
    }
  }

  @HostListener('window:keydown.escape', ['$event'])
  onEscapeKey(event: Event) {
    if (this.isOpen) {
      event.preventDefault();
      this.onClose();
    }
  }

  private onTabKey(event: KeyboardEvent) {
    if (event.key === 'Tab' && this.isOpen) {
      this.handleTabNavigation(event);
    }
  }

  private onFocusIn(event: FocusEvent) {
    if (!this.isOpen) return;

    const modalElement = this.elementRef.nativeElement.querySelector('.bg-white.rounded-lg');
    if (!modalElement) return;

    const target = event.target as HTMLElement;
    if (target && !modalElement.contains(target)) {
      // Focus moved outside the modal, redirect to first focusable element
      event.preventDefault();
      if (this.firstFocusableElement) {
        this.firstFocusableElement.focus();
      }
    }
  }


  onClose() {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent) {
    // Add null checks for robustness
    if (event && event.target && event.currentTarget && event.target === event.currentTarget) {
      this.onClose();
    }
  }


  private preventBodyScroll() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.bodyOverflow = document.body.style.overflow || '';
    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    this.renderer.setStyle(document.body, 'padding-right', `${scrollbarWidth}px`);
    this.isScrollPrevented = true;
  }

  private restoreBodyScroll() {
    if (!isPlatformBrowser(this.platformId) || !this.isScrollPrevented) return;

    this.renderer.setStyle(document.body, 'overflow', this.bodyOverflow);
    this.renderer.removeStyle(document.body, 'padding-right');
    this.isScrollPrevented = false;
  }

  private focusModal() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Store current focused element
    this.previousFocusElement = document.activeElement as HTMLElement;

    // Focus the first focusable element in the modal
    if (this.firstFocusableElement) {
      this.firstFocusableElement.focus();
    } else {
      // Fallback to modal element if no focusable elements found
      const modalElement = this.elementRef.nativeElement.querySelector('.bg-white.rounded-lg');
      if (modalElement) {
        modalElement.focus();
      }
    }
  }

  private restoreFocus() {
    if (!isPlatformBrowser(this.platformId) || !this.previousFocusElement) return;

    this.previousFocusElement.focus();
  }

  private updateFocusableElements() {
    const modalElement = this.elementRef.nativeElement.querySelector('.bg-white.rounded-lg');
    if (!modalElement) return;

    // Find all focusable elements within the modal
    const focusableSelectors = [
      'a[href]',
      'area[href]',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled]):not([aria-hidden="true"])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];

    const focusableElements = modalElement.querySelectorAll(focusableSelectors.join(', '));
    this.focusableElements = Array.from(focusableElements)
      .filter(el => {
        // Filter out elements that are not visible or have display: none
        if (!isPlatformBrowser(this.platformId)) return true; // Include all elements on server
        const style = window.getComputedStyle(el as HTMLElement);
        return style.display !== 'none' && style.visibility !== 'hidden';
      }) as HTMLElement[];

    if (this.focusableElements.length > 0) {
      // Prioritize the close button as first, then other buttons
      const closeButton = modalElement.querySelector('button[aria-label="Close modal"]') as HTMLElement;
      if (closeButton && this.focusableElements.includes(closeButton)) {
        // Move close button to end of focusable elements for better UX
        this.focusableElements = this.focusableElements.filter(el => el !== closeButton);
        this.focusableElements.push(closeButton);
      }

      this.firstFocusableElement = this.focusableElements[0];
      this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
    }
  }

  private clearFocusableElements() {
    this.focusableElements = [];
    this.firstFocusableElement = undefined;
    this.lastFocusableElement = undefined;
  }

  private handleTabNavigation(event: KeyboardEvent) {
    if (!isPlatformBrowser(this.platformId) || this.focusableElements.length === 0) return;

    event.preventDefault(); // Always prevent default tab behavior when modal is open

    const currentElement = document.activeElement as HTMLElement;
    const currentIndex = this.focusableElements.indexOf(currentElement);

    if (event.shiftKey) {
      // Shift + Tab: move backward
      if (currentIndex === -1) {
        // If not in focusable elements, go to last
        this.lastFocusableElement?.focus();
      } else if (currentIndex === 0) {
        // At first element, wrap to last
        this.lastFocusableElement?.focus();
      } else {
        // Move to previous element
        this.focusableElements[currentIndex - 1]?.focus();
      }
    } else {
      // Tab: move forward
      if (currentIndex === -1) {
        // If not in focusable elements, go to first
        this.firstFocusableElement?.focus();
      } else if (currentIndex === this.focusableElements.length - 1) {
        // At last element, wrap to first
        this.firstFocusableElement?.focus();
      } else {
        // Move to next element
        this.focusableElements[currentIndex + 1]?.focus();
      }
    }
  }

}
