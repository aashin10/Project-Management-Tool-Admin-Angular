import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionButtons, ActionType } from './action-buttons';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

describe('ActionButtons', () => {
  let component: ActionButtons;
  let fixture: ComponentFixture<ActionButtons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, LucideAngularModule, ActionButtons],
      declarations: [],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionButtons);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render all action buttons', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons.length).toBe(component.buttons.length);
  });

  it('should emit correct action type when a button is clicked', () => {
    spyOn(component.actionClick, 'emit');

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    buttons.forEach((btn, index) => {
      btn.nativeElement.click();
      expect(component.actionClick.emit).toHaveBeenCalledWith(component.buttons[index].type);
    });
  });

  it('should display correct icons for each button', () => {
    const images = fixture.debugElement.queryAll(By.css('img'));
    images.forEach((img, index) => {
      expect(img.attributes['src']).toBe(component.buttons[index].icon);
    });
  });
});
