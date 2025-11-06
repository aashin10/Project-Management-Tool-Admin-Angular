import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Navbar } from './navbar';
import { SearchBar } from '../components/search-bar/search-bar';
import { ActionButtons } from '../components/action-buttons/action-buttons';
import { Usermenu } from '../components/usermenu/usermenu';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, HttpClientTestingModule, SearchBar, ActionButtons, Usermenu, Navbar],
      declarations: [],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle user menu on profile action click', () => {
    // Test the logic directly
    expect(component.isUserMenuVisible).toBeFalse();
    component.onActionClick('profile');
    expect(component.isUserMenuVisible).toBeTrue();
    component.onActionClick('profile');
    expect(component.isUserMenuVisible).toBeFalse();
  });

  it('should conditionally render user menu', () => {
    component.isUserMenuVisible = true;
    fixture.detectChanges();

    const userMenu = fixture.debugElement.query(By.directive(Usermenu));
    expect(userMenu).toBeTruthy();

    component.isUserMenuVisible = false;
    fixture.detectChanges();

    const hiddenMenu = fixture.debugElement.query(By.directive(Usermenu));
    expect(hiddenMenu).toBeNull();
  });
});
