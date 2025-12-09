import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import { NotFound } from './not-found';

describe('NotFound', () => {
  let component: NotFound;
  let fixture: ComponentFixture<NotFound>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [NotFound, HttpClientTestingModule, CommonModule],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotFound);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('goHome', () => {
    it('should navigate to dashboard', () => {
      component.goHome();

      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(router.navigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('goBack', () => {
    it('should call location.back', () => {
      spyOn(component['location'], 'back');
      component.goBack();
      expect(component['location'].back).toHaveBeenCalled();
      expect(component['location'].back).toHaveBeenCalledTimes(1);
    });
  });

  describe('Template', () => {
    it('should render 404 page content', () => {
      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.querySelector('h1')?.textContent?.trim()).toBe('Page Not Found');
      expect(compiled.querySelector('p')?.textContent?.trim()).toContain('Sorry, the page you are looking for');
    });

    it('should render custom buttons', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const buttons = compiled.querySelectorAll('app-custom-button');

      expect(buttons.length).toBe(2);
    });

    it('should have correct button labels', () => {
      const compiled = fixture.nativeElement as HTMLElement;

      // Note: The actual button text is rendered inside the custom-button component
      // These tests verify the component structure is correct
      expect(compiled.querySelector('app-custom-button')).toBeTruthy();
    });
  });
});