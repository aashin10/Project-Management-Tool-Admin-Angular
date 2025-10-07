import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Usermenu } from './usermenu';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('Usermenu', () => {
  let component: Usermenu;
  let fixture: ComponentFixture<Usermenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, Usermenu],
      declarations: [],
    }).compileComponents();

    fixture = TestBed.createComponent(Usermenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display user name and email', () => {
    component.user.email = 'hello@gmail.com';
    component.user.name = 'John Doe';
    fixture.detectChanges();

    const nameEl = fixture.nativeElement.querySelector('.flex.flex-col p');
    const emailEl = fixture.nativeElement.querySelector('.text-xs.text-gray-500');

    expect(nameEl.textContent.trim()).toBe('John Doe');
    expect(emailEl.textContent.trim()).toBe('hello@gmail.com');
  });

  it('should render all menu items', () => {
    const menuItems = fixture.debugElement.queryAll(By.css('.cursor-pointer'));
    expect(menuItems.length).toBe(component.menuItems.length);
  });

  it('should display correct icon and label for each menu item', () => {
    const menuItems = fixture.debugElement.queryAll(By.css('.cursor-pointer'));

    menuItems.forEach((itemEl, index) => {
      const imgEl = itemEl.query(By.css('img'));
      const labelEl = itemEl.query(By.css('p'));

      expect(imgEl.attributes['src']).toBe(component.menuItems[index].icon);
      expect(labelEl.nativeElement.textContent.trim()).toBe(component.menuItems[index].label);
    });
  });
});
