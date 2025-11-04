import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamOrganizationComponent } from './teaminfo';
import { UserFilterResponse } from '../../../services/projects.service';

describe('TeamOrganizationComponent', () => {
  let component: TeamOrganizationComponent;
  let fixture: ComponentFixture<TeamOrganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamOrganizationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamOrganizationComponent);
    component = fixture.componentInstance;
    
    // Set up test data
    component.deliveryUnits = [
      { id: 1, code: 'ENG', name: 'Engineering', description: 'Engineering Team' },
      { id: 2, code: 'DES', name: 'Design', description: 'Design Team' }
    ];
    
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
      component.filteredUsers = [{ id: 1, name: 'Alice Johnson', email: 'alice.johnson@company.com' }];
      component.showManagerSuggestions = true;
      fixture.detectChanges();
      const listItems = fixture.nativeElement.querySelectorAll('ul li');
      expect(listItems.length).toBeGreaterThanOrEqual(1);
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
      const u: UserFilterResponse = { id: 1, name: 'Bob Smith', email: 'bob.smith@external.com' };
      component.selectManager(u);
      expect(component.manager).toBe('Bob Smith');
    });

    it('selectManager() should emit managerChange', () => {
      spyOn(component.managerChange, 'emit');
      const u: UserFilterResponse = { id: 1, name: 'Bob Smith', email: 'bob.smith@external.com' };
      component.selectManager(u);
      expect(component.managerChange.emit).toHaveBeenCalledWith('Bob Smith');
    });

    it('deliveryUnitChange should emit when select changes', async () => {
      spyOn(component.deliveryUnitChange, 'emit');
      const select: HTMLSelectElement = fixture.nativeElement.querySelector('#deliveryUnit');
      select.value = component.deliveryUnits[0].code;
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.deliveryUnitChange.emit).toHaveBeenCalledWith(component.deliveryUnits[0].code);
    });
  });

  // Component Logic
  describe('Component Logic', () => {
    it('onManagerInput should emit search and show suggestions', () => {
      spyOn(component.managerSearch, 'emit');
      component.onManagerInput('alice');
      expect(component.managerSearch.emit).toHaveBeenCalledWith('alice');
      expect(component.showManagerSuggestions).toBeTrue();
    });
    
    it('onManagerFocus should show suggestions and emit search', () => {
      spyOn(component.managerSearch, 'emit');
      component.onManagerFocus();
      expect(component.showManagerSuggestions).toBeTrue();
      expect(component.managerSearch.emit).toHaveBeenCalledWith('');
    });
    
    it('renders deliveryUnits options and emits on change', async () => {
      fixture.detectChanges();
      const select: HTMLSelectElement = fixture.nativeElement.querySelector('#deliveryUnit');
      const optionCount = select.querySelectorAll('option').length;
      expect(optionCount).toBe(component.deliveryUnits.length + 1);

      spyOn(component.deliveryUnitChange, 'emit');
      select.value = component.deliveryUnits[0].code;
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.deliveryUnitChange.emit).toHaveBeenCalledWith(component.deliveryUnits[0].code);
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('onManagerInput should handle null/undefined input', () => {
      spyOn(component.managerSearch, 'emit');
      component.onManagerInput(null as any);
      expect(component.managerSearch.emit).toHaveBeenCalled();
      expect(component.showManagerSuggestions).toBeTrue();

      component.onManagerInput(undefined as any);
      expect(component.managerSearch.emit).toHaveBeenCalled();
      expect(component.showManagerSuggestions).toBeTrue();
    });

    it('onManagerInput should handle empty string', () => {
      spyOn(component.managerSearch, 'emit');
      component.onManagerInput('');
      expect(component.managerSearch.emit).toHaveBeenCalledWith('');
      expect(component.showManagerSuggestions).toBeTrue();
    });

    it('onManagerInput should emit search for any input', () => {
      spyOn(component.managerSearch, 'emit');
      
      component.onManagerInput('ALICE');
      expect(component.managerSearch.emit).toHaveBeenCalledWith('ALICE');
      expect(component.showManagerSuggestions).toBeTrue();

      component.onManagerInput('alice');
      expect(component.managerSearch.emit).toHaveBeenCalledWith('alice');
      expect(component.showManagerSuggestions).toBeTrue();

      component.onManagerInput('Alice');
      expect(component.managerSearch.emit).toHaveBeenCalledWith('Alice');
      expect(component.showManagerSuggestions).toBeTrue();
    });
    
    it('clearManager should reset manager and hide suggestions', () => {
      spyOn(component.managerChange, 'emit');
      component.manager = 'Test Manager';
      component.clearManager();
      expect(component.manager).toBe('');
      expect(component.managerChange.emit).toHaveBeenCalledWith('');
      expect(component.showManagerSuggestions).toBeFalse();
    });
  });
});
