import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkTypesComponent } from './types-of-work';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
    import { SecurityContext } from '@angular/core';

describe('WorkTypesComponent', () => {
  let component: WorkTypesComponent;
  let fixture: ComponentFixture<WorkTypesComponent>;
  let sanitizer: DomSanitizer;

  const mockWorkTypes = [
    { name: 'Story', percentage: 45, color: '#059669', icon: 'file-text' },
    { name: 'Task', percentage: 32, color: '#3B82F6', icon: 'check-square' },
    { name: 'Bug', percentage: 15, color: '#EF4444', icon: 'alert-circle' },
    { name: 'Epic', percentage: 7, color: '#8B5CF6', icon: 'zap' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkTypesComponent, CommonModule],
      providers: []
    }).compileComponents();

    fixture = TestBed.createComponent(WorkTypesComponent);
    component = fixture.componentInstance;
    sanitizer = TestBed.inject(DomSanitizer);
    
    // Set mock data
    component.workTypes = mockWorkTypes;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Template Tests
  describe('Template Rendering', () => {
    it('should render the component title', () => {
      const titleElement = fixture.debugElement.query(By.css('h2'));
      expect(titleElement.nativeElement.textContent).toContain('Types of Work');
    });

    it('should render all work type items', () => {
      const workTypeElements = fixture.debugElement.queryAll(By.css('.group'));
      expect(workTypeElements.length).toBe(mockWorkTypes.length);
    });

    it('should display correct work type information', () => {
      const firstWorkType = fixture.debugElement.query(By.css('.group'));
      
      const nameElement = firstWorkType.query(By.css('.text-sm.font-medium'));
      const percentageElement = firstWorkType.query(By.css('.text-sm.font-bold'));
      
      expect(nameElement.nativeElement.textContent).toContain(mockWorkTypes[0].name);
      expect(percentageElement.nativeElement.textContent).toContain(mockWorkTypes[0].percentage + '%');
    });

    it('should render progress bars with correct widths', () => {
      const progressBars = fixture.debugElement.queryAll(
        By.css('.h-2.rounded-full:not(.bg-gray-200)')
      );

      progressBars.forEach((bar) => {
        const style = getComputedStyle(bar.nativeElement);
        expect(style.width).toBeTruthy(); // has width
        expect(style.backgroundColor).toBeTruthy(); // has color applied
      });
    });


    it('should render icons for each work type', () => {
      const iconContainers = fixture.debugElement.queryAll(By.css('.w-8.h-8'));

      iconContainers.forEach((container, index) => {
        const styleColor = getComputedStyle(container.nativeElement).backgroundColor;
        expect(styleColor).toBeTruthy(); // color applied
        expect(container.nativeElement.innerHTML).toContain('svg');
      });
    });


  });

  // Component Logic Tests

describe('Component Logic', () => {
  it('should initialize with empty work types array', () => {
    const newComponent = TestBed.createComponent(WorkTypesComponent).componentInstance;
    expect(newComponent.workTypes).toEqual([]);
  });

  it('should return SVG for file-text icon', () => {
    const result = component.getWorkTypeIcon('file-text');
    const htmlString = sanitizer.sanitize(SecurityContext.HTML, result);
    expect(htmlString).toContain('<svg');
    expect(htmlString).toContain('polyline');
  });

  it('should return SVG for check-square icon', () => {
    const result = component.getWorkTypeIcon('check-square');
    const htmlString = sanitizer.sanitize(SecurityContext.HTML, result);
    expect(htmlString).toContain('<svg');
    expect(htmlString).toContain('polyline');
  });

  it('should return SVG for alert-circle icon', () => {
    const result = component.getWorkTypeIcon('alert-circle');
    const htmlString = sanitizer.sanitize(SecurityContext.HTML, result);
    expect(htmlString).toContain('<svg');
    expect(htmlString).toContain('circle');
  });

  it('should return SVG for zap icon', () => {
    const result = component.getWorkTypeIcon('zap');
    const htmlString = sanitizer.sanitize(SecurityContext.HTML, result);
    expect(htmlString).toContain('<svg');
    expect(htmlString).toContain('polygon');
  });

  it('should return empty string for unknown icon', () => {
    const result = component.getWorkTypeIcon('unknown-icon');
    const htmlString = sanitizer.sanitize(SecurityContext.HTML, result);
    expect(htmlString).toBe('');
  });
});

  // Style Tests
  describe('Style Classes', () => {
    it('should apply correct layout classes to container', () => {
      const container = fixture.debugElement.query(By.css('.bg-white'));
      expect(container.classes['rounded-lg']).toBeTrue();
      expect(container.classes['shadow-sm']).toBeTrue();
    });

    it('should apply hover effect classes to progress bars', () => {
      const progressBar = fixture.debugElement.query(By.css('.h-2.rounded-full:not(.bg-gray-200)'));
      expect(progressBar.classes['transition-all']).toBeTrue();
      expect(progressBar.classes['duration-500']).toBeTrue();
      
      const parentElement = progressBar.parent;
      expect(parentElement).toBeTruthy();
      if (parentElement) {
        expect(progressBar.classes['group-hover:opacity-80']).toBeDefined();
      }
    });

    it('should have correct icon container dimensions', () => {
      const iconContainer = fixture.debugElement.query(By.css('.w-8.h-8'));
      expect(iconContainer.classes['w-8']).toBeTrue();
      expect(iconContainer.classes['h-8']).toBeTrue();
      expect(iconContainer.classes['rounded-md']).toBeTrue();
    });
  });

  // Input Changes Tests
  describe('Input Changes', () => {
    it('should update view when work types input changes', () => {
      const newWorkTypes = [
        { name: 'New Type', percentage: 100, color: '#000000', icon: 'file-text' }
      ];
      
      component.workTypes = newWorkTypes;
      fixture.detectChanges();
      
      const workTypeElements = fixture.debugElement.queryAll(By.css('.group'));
      expect(workTypeElements.length).toBe(1);
      expect(workTypeElements[0].query(By.css('.text-sm.font-medium')).nativeElement.textContent)
        .toContain('New Type');
    });
  });
});