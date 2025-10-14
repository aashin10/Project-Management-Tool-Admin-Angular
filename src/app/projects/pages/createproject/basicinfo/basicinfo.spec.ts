import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { BasicInformationComponent } from './basicinfo';

describe('BasicInformationComponent', () => {
  let component: BasicInformationComponent;
  let fixture: ComponentFixture<BasicInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Template Rendering
  describe('Template Rendering', () => {
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render project name input', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('#projectName')).toBeTruthy();
  });

  it('should render project key input', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('#projectKey')).toBeTruthy();
  });

  it('should render project description textarea', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('#description')).toBeTruthy();
  });
});

describe('NgIf rendering', () => {
  

  it('should not render status dropdown when statusDropdownOpen is false', () => {
    component.statusDropdownOpen = false;
    fixture.detectChanges();
    const dropdown = fixture.debugElement.query(By.css('div:nth-child(2) ul'));
    expect(dropdown).toBeNull();
  });

  it('should render status dropdown when statusDropdownOpen is true', () => {
    component.statusDropdownOpen = true;
    fixture.detectChanges();
    const dropdown = fixture.debugElement.query(By.css('div:nth-child(2) ul'));
    expect(dropdown).toBeTruthy();
  });
});

describe('NgFor rendering', () => {
  
  it('should render all status options when dropdown is open', () => {
    component.statusDropdownOpen = true;
    fixture.detectChanges();
    const options = fixture.debugElement.queryAll(By.css('div:nth-child(2) ul li'));
    expect(options.length).toBe(component.statusOptions.length);
  });
});

describe('Project Key & Name', () => {
  it('generateProjectKey should create key from projectName and emit', () => {
    spyOn(component.projectKeyChange, 'emit');
    component.projectName = 'My Project!';
    component.generateProjectKey();
    expect(component.projectKey).toBe('MYP-001');
    expect(component.projectKeyChange.emit).toHaveBeenCalledWith('MYP-001');
  });

  it('generateProjectKey should set default when projectName is empty and emit', () => {
    spyOn(component.projectKeyChange, 'emit');
    component.projectName = '';
    component.generateProjectKey();
    expect(component.projectKey).toBe('PRJ-001');
    expect(component.projectKeyChange.emit).toHaveBeenCalledWith('PRJ-001');
  });

  it('onProjectNameChange should emit projectNameChange', () => {
    spyOn(component.projectNameChange, 'emit');
    component.projectName = 'Alpha Team';
    component.onProjectNameChange();
    expect(component.projectNameChange.emit).toHaveBeenCalledWith('Alpha Team');
  });

  it('onProjectNameChange should generate and emit projectKey', () => {
    spyOn(component.projectKeyChange, 'emit');
    component.projectName = 'Alpha Team';
    component.onProjectNameChange();
    expect(component.projectKey).toBe('ALP-001');
    expect(component.projectKeyChange.emit).toHaveBeenCalled();
  });
});

describe('Status Logic', () => {
  

  it('selectStatus should set status, emit, and close dropdown', () => {
    spyOn(component.statusChange, 'emit');
    component.statusDropdownOpen = true;
    component.selectStatus('inprogress');
    expect(component.status).toBe('inprogress');
    expect(component.statusChange.emit).toHaveBeenCalledWith('inprogress');
    expect(component.statusDropdownOpen).toBeFalse();
  });

  
});

// Edge Cases
describe('Edge Cases', () => {
  it('generateProjectKey should handle null/undefined projectName', () => {
    component.projectName = null as any;
    component.generateProjectKey();
    expect(component.projectKey).toBe('PRJ-001');

    component.projectName = undefined as any;
    component.generateProjectKey();
    expect(component.projectKey).toBe('PRJ-001');
  });

  it('generateProjectKey should handle extremely long project names', () => {
    component.projectName = 'A'.repeat(1000);
    component.generateProjectKey();
    expect(component.projectKey).toBe('AAA-001');
  });

  it('generateProjectKey should handle special characters and numbers', () => {
    spyOn(component.projectKeyChange, 'emit');
    component.projectName = '!@#My$%^Project&*()123';
    component.generateProjectKey();
    expect(component.projectKey).toBe('MYP-001');
    expect(component.projectKeyChange.emit).toHaveBeenCalledWith('MYP-001');
  });
 

  

  it('selectStatus should handle empty/null values', () => {
    spyOn(component.statusChange, 'emit');
    component.selectStatus('');
    expect(component.status).toBe('');
    expect(component.statusChange.emit).toHaveBeenCalledWith('');

    component.selectStatus(undefined as any);
    expect(component.status as any).toBe(undefined);
    expect(component.statusChange.emit).toHaveBeenCalledWith(undefined as any);
  });

  it('onProjectNameChange should handle extremely long names', () => {
    spyOn(component.projectNameChange, 'emit');
    const longName = 'A'.repeat(10000);
    component.projectName = longName;
    component.onProjectNameChange();
    expect(component.projectNameChange.emit).toHaveBeenCalledWith(longName);
  });
});

});
