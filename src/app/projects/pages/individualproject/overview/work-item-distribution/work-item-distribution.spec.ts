
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { WorkItemDistributionComponent } from './work-item-distribution';


// describe('WorkItemDistributionComponent', () => {
//   let component: WorkItemDistributionComponent;
//   let fixture: ComponentFixture<WorkItemDistributionComponent>;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [WorkItemDistributionComponent] 
//     }).compileComponents();

//     fixture = TestBed.createComponent(WorkItemDistributionComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });


import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkItemDistributionComponent } from './work-item-distribution';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('WorkItemDistributionComponent', () => {
  let component: WorkItemDistributionComponent;
  let fixture: ComponentFixture<WorkItemDistributionComponent>;

  const mockWorkItems = [
    { label: 'To Do', value: 5, percentage: 25, color: '#FF5733' },
    { label: 'In Progress', value: 10, percentage: 50, color: '#33C1FF' },
    { label: 'Done', value: 5, percentage: 25, color: '#75FF33' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkItemDistributionComponent, CommonModule]
    }).compileComponents();

    fixture = TestBed.createComponent(WorkItemDistributionComponent);
    component = fixture.componentInstance;

    // Set mock input data
    component.workItemDistribution = mockWorkItems;
    component.totalItems = 20;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Template Tests
  describe('Template Rendering', () => {
    it('should render the component title', () => {
      const titleElement = fixture.debugElement.query(By.css('h2'));
      expect(titleElement.nativeElement.textContent).toContain('Work Item Distribution');
    });

    it('should render all donut chart segments', () => {
      const segments = fixture.debugElement.queryAll(By.css('.chart-segment'));
      expect(segments.length).toBe(mockWorkItems.length);
    });

    it('should display total items in center when no segment is hovered', () => {
      const centerValue = fixture.debugElement.query(By.css('.text-4xl'));
      const centerLabel = fixture.debugElement.query(By.css('.text-xs'));
      
      expect(centerValue.nativeElement.textContent.trim()).toBe('20');
      expect(centerLabel.nativeElement.textContent.trim()).toBe('Total Items');
    });

    it('should render legend items', () => {
      const legendItems = fixture.debugElement.queryAll(By.css('.space-y-2 > div'));
      expect(legendItems.length).toBe(mockWorkItems.length);
    });

    it('should display correct total in footer', () => {
      const totalElement = fixture.debugElement.query(By.css('.text-lg'));
      expect(totalElement.nativeElement.textContent.trim()).toBe('20');
    });
  });

  // Component Logic Tests
  describe('Component Logic', () => {
    it('should calculate correct stroke dasharray', () => {
      const circumference = 2 * Math.PI * 85;
      const expectedDasharray = `${(25/100) * circumference} ${circumference - ((25/100) * circumference)}`;
      expect(component.getStrokeDasharray(25)).toBe(expectedDasharray);
    });

    it('should calculate correct stroke dashoffset', () => {
      const circumference = 2 * Math.PI * 85;
      const expectedOffset = -((75/100) * circumference);
      expect(component.getStrokeDashoffset(75)).toBe(expectedOffset);
    });

    it('should set hovered segment correctly', () => {
      component.setHoveredSegment(1);
      expect(component.hoveredSegment).toBe(1);

      component.setHoveredSegment(-1);
      expect(component.hoveredSegment).toBe(-1);
    });

    it('should calculate tooltip position', () => {
      component.setHoveredSegment(0);
      const position = component.getTooltipPosition();
      
      expect(position).toBeDefined();
      expect(position.x).toBeDefined();
      expect(position.y).toBeDefined();
    });
  });

  // Interaction Tests
  describe('User Interactions', () => {
    it('should update center text on segment hover', () => {
      const firstSegment = fixture.debugElement.queryAll(By.css('.chart-segment'))[0];
      firstSegment.triggerEventHandler('mouseenter', null);
      fixture.detectChanges();

      const centerValue = fixture.debugElement.query(By.css('.text-4xl'));
      const centerLabel = fixture.debugElement.query(By.css('.text-xs'));

      expect(centerValue.nativeElement.textContent.trim()).toBe('5');
      expect(centerLabel.nativeElement.textContent.trim()).toBe('To Do');
    });

    it('should show tooltip on segment hover', () => {
      const segment = fixture.debugElement.queryAll(By.css('.chart-segment'))[0];
      segment.triggerEventHandler('mouseenter', null);
      fixture.detectChanges();

      const tooltip = fixture.debugElement.query(By.css('.bg-white.border'));
      expect(tooltip).toBeTruthy();
      expect(tooltip.nativeElement.textContent).toContain('To Do: 5 items (25%)');
    });

    it('should highlight legend item on hover', () => {
      const legendItem = fixture.debugElement.queryAll(By.css('.space-y-2 > div'))[0];
      legendItem.triggerEventHandler('mouseenter', null);
      fixture.detectChanges();

      expect(legendItem.classes['bg-gray-50']).toBeTrue();
    });
  });

  // Style Tests
  describe('Style Classes', () => {
    it('should apply correct classes to chart segments', () => {
      const segment = fixture.debugElement.query(By.css('.chart-segment'));
      expect(segment.classes['chart-segment']).toBeTrue();
    });

    it('should apply hover effects to segments', () => {
      const segment = fixture.debugElement.queryAll(By.css('.chart-segment'))[0];
      segment.triggerEventHandler('mouseenter', null);
      fixture.detectChanges();

      expect(segment.classes['segment-hovered']).toBeTrue();
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
it('should handle empty work item distribution', () => {
  component.setHoveredSegment(-1); // ✅ reset hovered
  component.workItemDistribution = [];
  fixture.detectChanges();

  const segments = fixture.debugElement.queryAll(By.css('.chart-segment'));
  expect(segments.length).toBe(0);
});


    it('should handle zero total items', () => {
      component.totalItems = 0;
      fixture.detectChanges();

      const totalElement = fixture.debugElement.query(By.css('.text-lg'));
      expect(totalElement.nativeElement.textContent.trim()).toBe('0');
    });

    it('should handle invalid hover index', () => {
      component.setHoveredSegment(999);
      const position = component.getTooltipPosition();
      expect(position.x).toBeDefined();
      expect(position.y).toBeDefined();
    });
  });
});
