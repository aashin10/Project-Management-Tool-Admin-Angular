import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Usermenu } from './usermenu';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

describe('Usermenu', () => {
  let component: Usermenu;
  let fixture: ComponentFixture<Usermenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, Usermenu, HttpClientTestingModule],
      declarations: [],
    }).compileComponents();

    fixture = TestBed.createComponent(Usermenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default user data', () => {
    expect(component.user.name).toBe('Loading...');
    expect(component.user.email).toBe('Loading...');
  });

  it('should display updated user name and email', () => {
    component.user.email = 'hello@gmail.com';
    component.user.name = 'John Doe';
    fixture.detectChanges();

    const nameEl = fixture.nativeElement.querySelector('.text-sm.font-semibold');
    const emailEl = fixture.nativeElement.querySelector('.text-xs.text-gray-600');

    expect(nameEl?.textContent.trim()).toBe('John Doe');
    expect(emailEl?.textContent.trim()).toBe('hello@gmail.com');
  });

  it('should render all menu items as buttons', () => {
    const menuButtons = fixture.debugElement.queryAll(By.css('button'));
    expect(menuButtons.length).toBe(component.menuItems.length);
  });

  it('should display correct icon and label for each menu item', () => {
    const menuButtons = fixture.debugElement.queryAll(By.css('button'));

    menuButtons.forEach((buttonEl, index) => {
      const imgEl = buttonEl.query(By.css('img'));
      const labelEl = buttonEl.query(By.css('span'));

      expect(imgEl?.attributes['src']).toBe(component.menuItems[index].icon);
      expect(labelEl?.nativeElement.textContent.trim()).toBe(component.menuItems[index].label);
    });
  });
});
