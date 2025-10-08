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
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should render manager input', () => {
      const input: HTMLInputElement = fixture.nativeElement.querySelector('#managerInput');
      expect(input).toBeTruthy();
    });

    it('should render deliveryUnit select', () => {
      const select: HTMLSelectElement = fixture.nativeElement.querySelector('#deliveryUnit');
      expect(select).toBeTruthy();
    });

    it('should render suggestion list when showManagerSuggestions=true', () => {
      component.filteredManagers = [{ user: 'Alice Johnson', email: 'alice.johnson@company.com' }];
      component.showManagerSuggestions = true;
      fixture.detectChanges();
      const listItems = fixture.nativeElement.querySelectorAll('ul li');
      expect(listItems.length).toBe(1);
    });

    it('should render all deliveryUnits in select', () => {
      const select: HTMLSelectElement = fixture.nativeElement.querySelector('#deliveryUnit');
      const options = select.querySelectorAll('option');
      expect(options.length).toBe(component.deliveryUnits.length + 1); // +1 for default option
    });
  });

  // Input/Output Properties
  describe('Input/Output Properties', () => {
    it('should have showManagerSuggestions=false by default', () => {
      expect(component.showManagerSuggestions).toBeFalse();
    });

    it('selectManager() should set manager', () => {
      const u = { user: 'Bob Smith', email: 'bob.smith@external.com' };
      component.selectManager(u);
      expect(component.manager).toBe('Bob Smith');
    });

    it('selectManager() should emit managerChange', () => {
      spyOn(component.managerChange, 'emit');
      const u = { user: 'Bob Smith', email: 'bob.smith@external.com' };
      component.selectManager(u);
      expect(component.managerChange.emit).toHaveBeenCalledWith('Bob Smith');
    });

    it('deliveryUnitChange should emit when select changes', async () => {
      spyOn(component.deliveryUnitChange, 'emit');
      const select: HTMLSelectElement = fixture.nativeElement.querySelector('#deliveryUnit');
      select.value = component.deliveryUnits[0].duCode;
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.deliveryUnitChange.emit).toHaveBeenCalledWith(component.deliveryUnits[0].duCode);
    });
  });

  // Component Logic
  describe('Component Logic', () => {
    it('onManagerInput should filter users and show suggestions', () => {
      component.onManagerInput('alice');
      expect(component.filteredManagers.length).toBeGreaterThanOrEqual(1);
      expect(component.showManagerSuggestions).toBeTrue();
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

  // Edge Cases
  describe('Edge Cases', () => {
    it('onManagerInput should handle null/undefined input', () => {
      component.onManagerInput(null as any);
      expect(component.filteredManagers).toEqual([]);
      expect(component.showManagerSuggestions).toBeFalse();

      component.onManagerInput(undefined as any);
      expect(component.filteredManagers).toEqual([]);
      expect(component.showManagerSuggestions).toBeFalse();
    });

    it('onManagerInput should handle empty string', () => {
      component.onManagerInput('');
      expect(component.filteredManagers).toEqual([]);
      expect(component.showManagerSuggestions).toBeFalse();
    });

    it('onManagerInput should be case insensitive', () => {
      component.onManagerInput('ALICE');
      expect(component.filteredManagers.length).toBeGreaterThan(0);
      expect(component.showManagerSuggestions).toBeTrue();

      component.onManagerInput('alice');
      expect(component.filteredManagers.length).toBeGreaterThan(0);
      expect(component.showManagerSuggestions).toBeTrue();

      component.onManagerInput('Alice');
      expect(component.filteredManagers.length).toBeGreaterThan(0);
      expect(component.showManagerSuggestions).toBeTrue();
    });
  });
});
