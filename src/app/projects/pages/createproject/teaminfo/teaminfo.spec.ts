import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { TeamOrganizationComponent } from './teaminfo';

describe('TeamOrganizationComponent', () => {
  let component: TeamOrganizationComponent;
  let fixture: ComponentFixture<TeamOrganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamOrganizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters managers when typing', () => {
    component.onManagerInput('alice');
    expect(component.filteredManagers.length).toBeGreaterThan(0);
    expect(component.showManagerSuggestions).toBeTrue();
    // ensure the filtered result contains the expected user
    expect(component.filteredManagers.some(u => u.user.toLowerCase().includes('alice'))).toBeTrue();
  });

  it('selectManager sets manager and emits managerChange', () => {
    spyOn(component.managerChange, 'emit');
    const u = { user: 'Test User', email: 'test@example.com' };
    component.selectManager(u);
    expect(component.manager).toBe('Test User');
    expect(component.managerChange.emit).toHaveBeenCalledWith('Test User');
    expect(component.showManagerSuggestions).toBeFalse();
  });

  it('renders deliveryUnits options', () => {
    fixture.detectChanges();
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#deliveryUnit');
    // placeholder + deliveryUnits length
    const optionCount = select.querySelectorAll('option').length;
    expect(optionCount).toBe(component.deliveryUnits.length + 1);
    // first dynamic option label matches pattern
    const firstDynamic = select.querySelectorAll('option')[1];
    expect(firstDynamic.textContent).toContain(component.deliveryUnits[0].duInfo.name);
    expect(firstDynamic.textContent).toContain(component.deliveryUnits[0].duInfo.subtitle);
  });

  it('emits deliveryUnitChange when selection changes', async () => {
    spyOn(component.deliveryUnitChange, 'emit');
    fixture.detectChanges();
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#deliveryUnit');
    // choose second option (first dynamic entry)
    select.value = component.deliveryUnits[0].duCode;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.deliveryUnitChange.emit).toHaveBeenCalledWith(component.deliveryUnits[0].duCode);
  });

  it('NgIf: shows or hides the suggestions list based on showManagerSuggestions', () => {
    // show case
    component.filteredManagers = [ { user: 'Alpha One', email: 'a@x.com' } ];
    component.showManagerSuggestions = true;
    fixture.detectChanges();
    let ul = fixture.nativeElement.querySelector('ul');
    expect(ul).toBeTruthy();

    // hide case
    component.showManagerSuggestions = false;
    fixture.detectChanges();
    ul = fixture.nativeElement.querySelector('ul');
    expect(ul).toBeNull();
  });

  it('NgFor: renders suggestions list items based on filteredManagers', () => {
    component.filteredManagers = [
      { user: 'Alpha One', email: 'a@x.com' },
      { user: 'Beta Two', email: 'b@x.com' },
      { user: 'Gamma Three', email: 'g@x.com' }
    ];
    component.showManagerSuggestions = true;
    fixture.detectChanges();

    const ul = fixture.nativeElement.querySelector('ul');
    expect(ul).toBeTruthy();
    const items = ul.querySelectorAll('li');
    expect(items.length).toBe(3);
    expect(items[0].textContent).toContain('Alpha One');
    expect(items[1].textContent).toContain('Beta Two');
    expect(items[2].textContent).toContain('Gamma Three');
  });

});
