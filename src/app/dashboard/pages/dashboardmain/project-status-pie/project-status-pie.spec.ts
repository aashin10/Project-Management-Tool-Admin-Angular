import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectStatusComponent, ProjectStatusData, PieChartSegment } from './project-status-pie';
import { By } from '@angular/platform-browser';

describe('ProjectStatusComponent', () => {
  let component: ProjectStatusComponent;
  let fixture: ComponentFixture<ProjectStatusComponent>;

  const mockData: ProjectStatusData[] = [
    { deliveryUnit: 'DU1', inProgress: 5, completed: 3, onHold: 2, total: 10 },
    { deliveryUnit: 'DU2', inProgress: 4, completed: 4, onHold: 2, total: 10 }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectStatusComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectStatusComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize delivery units and chart data on init', () => {
      component.statusData = mockData;
      component.ngOnInit();
      expect(component.deliveryUnits).toContain('All Delivery Units');
      expect(component.deliveryUnits).toContain('DU1');
      expect(component.deliveryUnits).toContain('DU2');
      expect(component.chartSegments.length).toBeGreaterThan(0);
    });
  });

  describe('Dropdown Behavior', () => {
    beforeEach(() => {
      component.statusData = mockData;
      component.ngOnInit();
    });

    it('should toggle dropdown open/close', () => {
      expect(component.dropdownOpen).toBeFalse();
      component.toggleDropdown();
      expect(component.dropdownOpen).toBeTrue();
      component.toggleDropdown();
      expect(component.dropdownOpen).toBeFalse();
    });

    it('should close dropdown explicitly', () => {
      component.dropdownOpen = true;
      component.closeDropdown();
      expect(component.dropdownOpen).toBeFalse();
    });

    it('should change selected delivery unit and update chart', () => {
      const spy = spyOn<any>(component, 'updateChartData').and.callThrough();
      component.onDeliveryUnitChange('DU1');
      expect(component.selectedDeliveryUnit).toBe('DU1');
      expect(component.dropdownOpen).toBeFalse();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Chart Data Calculation', () => {
    beforeEach(() => {
      component.statusData = mockData;
      component.ngOnInit();
    });

    it('should correctly calculate total projects for All Delivery Units', () => {
      component.selectedDeliveryUnit = 'All Delivery Units';
      component['updateChartData']();
      expect(component.totalProjects).toBe(20);
    });

    it('should calculate total projects for a specific delivery unit', () => {
      component.selectedDeliveryUnit = 'DU1';
      component['updateChartData']();
      expect(component.totalProjects).toBe(10);
    });

    it('should handle missing delivery unit gracefully', () => {
      component.selectedDeliveryUnit = 'Invalid';
      component['updateChartData']();
      expect(component.totalProjects).toBe(0);
      expect(component.chartSegments.length).toBe(0);
    });
  });

  describe('Chart Segment Generation', () => {
    it('should generate correct segment angles and percentages', () => {
      const data = { inProgress: 5, completed: 3, onHold: 2 };
      component.totalProjects = 10;
      component['generateChartSegments'](data);

      const totalPercent = component.chartSegments.reduce((sum, seg) => sum + seg.percentage, 0);
      expect(Math.round(totalPercent)).toBe(100);
      expect(component.chartSegments.length).toBe(3);
    });
  });

  describe('Hover Interactions', () => {
    beforeEach(() => {
      component.statusData = mockData;
      component.ngOnInit();
    });

    it('should set hoveredSegment on mouse enter', () => {
      component.onSegmentHover('Completed');
      expect(component.hoveredSegment).toBe('Completed');
    });

    it('should clear hoveredSegment on mouse leave', () => {
      component.hoveredSegment = 'On Hold';
      component.onSegmentLeave();
      expect(component.hoveredSegment).toBeNull();
    });

    it('should return correct hovered segment count', () => {
      component.hoveredSegment = 'In Progress';
      const seg = component.chartSegments.find(s => s.status === 'In Progress');
      const count = seg ? seg.count : 0;
      expect(component.getHoveredSegmentCount()).toBe(count);
    });

    it('should return false if no hovered segment', () => {
      component.hoveredSegment = null;
      expect(component.getHoveredSegmentCount()).toBe(0);
    });

    it('should identify if a button is hovered', () => {
      component.hoveredSegment = 'Completed';
      expect(component.isButtonHovered('Completed')).toBeTrue();
      expect(component.isButtonHovered('In Progress')).toBeFalse();
    });
  });

  describe('Utility Methods', () => {
    it('should convert polar to cartesian coordinates correctly', () => {
    const point = component['polarToCartesian'](100, 100, 85, 90);
    expect(point.x).toBeCloseTo(185);
    expect(point.y).toBeCloseTo(100);

    });

    it('should return valid SVG path data', () => {
      const seg: PieChartSegment = {
        status: 'In Progress',
        count: 5,
        percentage: 50,
        color: '#2563eb',
        hoverColor: '#1d4ed8',
        startAngle: 0,
        endAngle: 180
      };
      const path = component.getPathData(seg, 0);
      expect(path).toContain('M');
      expect(path).toContain('A');
      expect(path).toContain('Z');
    });

    it('should compute line end coordinates correctly', () => {
      const seg: PieChartSegment = {
        status: 'Completed',
        count: 5,
        percentage: 50,
        color: '#059669',
        hoverColor: '#047857',
        startAngle: 0,
        endAngle: 120
      };
      const x = component.getLineEndX(seg, 0);
      const y = component.getLineEndY(seg, 0);
      expect(x).toBeDefined();
      expect(y).toBeDefined();
    });

    it('should return correct color for hovered segment', () => {
      const seg: PieChartSegment = {
        status: 'Completed',
        count: 3,
        percentage: 30,
        color: '#059669',
        hoverColor: '#047857',
        startAngle: 0,
        endAngle: 108
      };
      component.hoveredSegment = 'Completed';
      expect(component.getCurrentSegmentColor(seg)).toBe(seg.hoverColor);
      component.hoveredSegment = null;
      expect(component.getCurrentSegmentColor(seg)).toBe(seg.color);
    });
  });

  describe('Empty State', () => {
    it('should handle empty status data gracefully', () => {
      component.statusData = [];
      component.ngOnInit();
      expect(component.totalProjects).toBe(0);
      expect(component.chartSegments.length).toBe(0);
    });
  });
});
