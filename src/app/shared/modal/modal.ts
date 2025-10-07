import { Component, Input, Output, EventEmitter, HostListener, ElementRef, OnInit, OnDestroy, OnChanges, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

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
export class Modal implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  private previousFocusElement?: HTMLElement;
  private bodyOverflow: string = '';
  private isScrollPrevented: boolean = false;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    // Store initial body overflow
    this.bodyOverflow = document.body.style.overflow || '';
  }

  ngOnDestroy() {
    // Cleanup: restore body scroll
    this.restoreBodyScroll();
  }

  @HostListener('window:keydown.escape', ['$event'])
  onEscapeKey(event: Event) {
    if (this.isOpen) {
      event.preventDefault();
      this.onClose();
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

  // Handle modal open/close effects
  private handleModalState() {
    if (this.isOpen) {
      this.preventBodyScroll();
      this.focusModal();
    } else {
      this.restoreBodyScroll();
      this.restoreFocus();
    }
  }

  private preventBodyScroll() {
    this.bodyOverflow = document.body.style.overflow || '';
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    this.isScrollPrevented = true;
  }

  private restoreBodyScroll() {
    if (this.isScrollPrevented) {
      this.renderer.setStyle(document.body, 'overflow', this.bodyOverflow);
      this.isScrollPrevented = false;
    }
  }

  private focusModal() {
    // Store current focused element
    this.previousFocusElement = document.activeElement as HTMLElement;

    // Focus the modal content or close button
    const modalElement = this.elementRef.nativeElement.querySelector('.bg-white.rounded-lg');
    if (modalElement) {
      // Focus the close button for accessibility
      const closeButton = modalElement.querySelector('button');
      if (closeButton) {
        closeButton.focus();
      } else {
        modalElement.focus();
      }
    }
  }

  private restoreFocus() {
    if (this.previousFocusElement) {
      this.previousFocusElement.focus();
    }
  }

  // Call this when isOpen changes (would be handled by Angular change detection)
  ngOnChanges() {
    this.handleModalState();
  }
}
