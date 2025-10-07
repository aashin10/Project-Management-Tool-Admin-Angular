import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamOrganizationComponent } from './teaminfo';

describe('TeamOrganizationComponent', () => {
  let component: TeamOrganizationComponent;
  let fixture: ComponentFixture<TeamOrganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamOrganizationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Template Rendering
  describe('Template Rendering', () => {
    it('should render and show suggestion list when available', () => {
      component.filteredManagers = [{ user: 'Alice Johnson', email: 'alice.johnson@company.com' }];
      component.showManagerSuggestions = true;
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      const list = el.querySelectorAll('ul li');
      expect(list.length).toBeGreaterThanOrEqual(1);
    });
  });

  // Input/Output Properties
  describe('Input/Output Properties', () => {
    it('should initialize with showManagerSuggestions as false by default', () => {
      expect(component.showManagerSuggestions).toBeFalse();
    });

    it('selectManager should set manager and emit managerChange', () => {
      spyOn(component.managerChange, 'emit');
      const u = { user: 'Bob Smith', email: 'bob.smith@external.com' };
      component.selectManager(u);
      expect(component.manager).toBe('Bob Smith');
      expect(component.managerChange.emit).toHaveBeenCalledWith('Bob Smith');
    });
  });

  // Component Logic
  describe('Component Logic', () => {
    it('onManagerInput should filter users and show suggestions', () => {
      component.onManagerInput('alice');
      expect(component.filteredManagers.length).toBeGreaterThanOrEqual(1);
      expect(component.showManagerSuggestions).toBeTrue();
    });

    it('clearManager should clear the manager and suggestions and emit', () => {
      spyOn(component.managerChange, 'emit');
      component.manager = 'Someone';
      component.filteredManagers = [{ user: 'X', email: 'x@x' }];
      component.showManagerSuggestions = true;
      component.clearManager();
      expect(component.manager).toBe('');
      expect(component.filteredManagers.length).toBe(0);
      expect(component.showManagerSuggestions).toBeFalse();
      expect(component.managerChange.emit).toHaveBeenCalledWith('');
    });

    it('renders deliveryUnits options and emits on change', async () => {
      fixture.detectChanges();
      const select: HTMLSelectElement = fixture.nativeElement.querySelector('#deliveryUnit');
      const optionCount = select.querySelectorAll('option').length;
      expect(optionCount).toBe(component.deliveryUnits.length + 1);

      spyOn(component.deliveryUnitChange, 'emit');
      select.value = component.deliveryUnits[0].duCode;
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.deliveryUnitChange.emit).toHaveBeenCalledWith(component.deliveryUnits[0].duCode);
    });
  });
});
