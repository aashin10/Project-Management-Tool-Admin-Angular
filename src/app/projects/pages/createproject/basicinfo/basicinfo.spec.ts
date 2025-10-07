import { ComponentFixture, TestBed } from '@angular/core/testing';

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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('generateProjectKey should create key from projectName and emit', () => {
    spyOn(component.projectKeyChange, 'emit');
    component.projectName = 'My Project!';
    component.generateProjectKey();
    expect(component.projectKey).toBe('MYP-001');
    expect(component.projectKeyChange.emit).toHaveBeenCalledWith('MYP-001');
  });

  it('generateProjectKey should set default when projectName empty and emit', () => {
    spyOn(component.projectKeyChange, 'emit');
    component.projectName = '';
    component.generateProjectKey();
    expect(component.projectKey).toBe('PRJ-001');
    expect(component.projectKeyChange.emit).toHaveBeenCalledWith('PRJ-001');
  });

  it('should handle empty input fields and generate default project key', async () => {
    // ensure all inputs are empty
    component.projectName = '';
    component.projectKey = '';
    component.description = '';
    component.priority = '';
    component.status = '';
    fixture.detectChanges();

    await fixture.whenStable();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const nameInput = el.querySelector('#projectName') as HTMLInputElement;
    const keyInput = el.querySelector('#projectKey') as HTMLInputElement;
    const descTextarea = el.querySelector('#description') as HTMLTextAreaElement;

    expect(nameInput).withContext('projectName input exists').toBeTruthy();
    expect(keyInput).withContext('projectKey input exists').toBeTruthy();
    expect(descTextarea).withContext('description textarea exists').toBeTruthy();

    expect(nameInput.value).toBe('');
    expect(keyInput.value).toBe('');
    expect(descTextarea.value).toBe('');

    // selected getters should point to the placeholder option (empty value)
    expect(component.selectedPriority.value).toBe('');
    expect(component.selectedStatus.value).toBe('');

    // generateProjectKey should set the default and emit
    spyOn(component.projectKeyChange, 'emit');
    component.generateProjectKey();
    expect(component.projectKey).toBe('PRJ-001');
    expect(component.projectKeyChange.emit).toHaveBeenCalledWith('PRJ-001');
  });

  it('onProjectNameChange should emit projectNameChange and generate key', () => {
    spyOn(component.projectNameChange, 'emit');
    spyOn(component.projectKeyChange, 'emit');
    component.projectName = 'Alpha Team';
    component.onProjectNameChange();
    expect(component.projectNameChange.emit).toHaveBeenCalledWith('Alpha Team');
    // projectKey generated from name
    expect(component.projectKey).toBe('ALP-001');
    expect(component.projectKeyChange.emit).toHaveBeenCalled();
  });

  it('should toggle status dropdown', () => {
    component.statusDropdownOpen = false;
    component.toggleStatusDropdown();
    expect(component.statusDropdownOpen).toBeTrue();
    component.toggleStatusDropdown();
    expect(component.statusDropdownOpen).toBeFalse();
  });

  it('selectStatus should set status, emit and close dropdown', () => {
    spyOn(component.statusChange, 'emit');
    component.statusDropdownOpen = true;
    component.selectStatus('inprogress');
    expect(component.status).toBe('inprogress');
    expect(component.statusChange.emit).toHaveBeenCalledWith('inprogress');
    expect(component.statusDropdownOpen).toBeFalse();
  });

  it('selectedStatus getter returns matching option', () => {
    component.status = 'completed';
    const s = component.selectedStatus;
    expect(s).toBeTruthy();
    expect(s.value).toBe('completed');
  });

  it('should toggle priority dropdown', () => {
    component.priorityDropdownOpen = false;
    component.togglePriorityDropdown();
    expect(component.priorityDropdownOpen).toBeTrue();
    component.togglePriorityDropdown();
    expect(component.priorityDropdownOpen).toBeFalse();
  });

  it('selectPriority should set priority, emit and close dropdown', () => {
    spyOn(component.priorityChange, 'emit');
    component.priorityDropdownOpen = true;
    component.selectPriority('high');
    expect(component.priority).toBe('high');
    expect(component.priorityChange.emit).toHaveBeenCalledWith('high');
    expect(component.priorityDropdownOpen).toBeFalse();
  });

  it('selectedPriority getter returns matching option', () => {
    component.priority = 'medium';
    const p = component.selectedPriority;
    expect(p).toBeTruthy();
    expect(p.value).toBe('medium');
  });

  it('renders priority and status option lists when dropdowns are open (NgIf + NgFor)', () => {
    // open both dropdowns
    component.priorityDropdownOpen = true;
    component.statusDropdownOpen = true;
    fixture.detectChanges();

    const uls = fixture.nativeElement.querySelectorAll('ul');
    // Expect two dropdown lists to be present
    expect(uls.length).toBeGreaterThanOrEqual(2);

    const priorityLis = uls[0].querySelectorAll('li');
    const statusLis = uls[1].querySelectorAll('li');

    expect(priorityLis.length).toBe(component.priorityOptions.length);
    expect(statusLis.length).toBe(component.statusOptions.length);
  });

  it('does not render option lists when dropdowns are closed (NgIf)', () => {
    component.priorityDropdownOpen = false;
    component.statusDropdownOpen = false;
    fixture.detectChanges();

    const uls = fixture.nativeElement.querySelectorAll('ul');
    expect(uls.length).toBe(0);
  });

  
  it('should accept @Input projectName and reflect in component', () => {
    component.projectName = 'Banking System';
    fixture.detectChanges();
    expect(component.projectName).toBe('Banking System');
  });
  it('should accept @Input projectKey', () => {
    component.projectKey = 'BNK-001';
    fixture.detectChanges();
    expect(component.projectKey).toBe('BNK-001');
  });

  it('should accept @Input description', () => {
    component.description = 'This is a test project';
    fixture.detectChanges();
    expect(component.description).toBe('This is a test project');
  });

  it('should accept @Input priority', () => {
    component.priority = 'high';
    fixture.detectChanges();
    expect(component.priority).toBe('high');
    expect(component.selectedPriority.label).toBe('High');
  });

  it('should accept @Input status', () => {
    component.status = 'completed';
    fixture.detectChanges();
    expect(component.status).toBe('completed');
    expect(component.selectedStatus.label).toBe('Completed');
  });

  it('should allow subscription to @Output emitters and receive emitted values', () => {
    let emittedName: string | null = null;
    let emittedKey: string | null = null;
    let emittedStatus: string | null = null;

    component.projectNameChange.subscribe(v => emittedName = v);
    component.projectKeyChange.subscribe(v => emittedKey = v);
    component.statusChange.subscribe(v => emittedStatus = v);

    component.projectName = 'Sub Name';
    component.onProjectNameChange();
  expect(emittedName!).toBe('Sub Name');

  component.generateProjectKey();
  expect(emittedKey!).toBe(component.projectKey);

  component.selectStatus('pending');
  expect(emittedStatus!).toBe('pending');
  });
});
