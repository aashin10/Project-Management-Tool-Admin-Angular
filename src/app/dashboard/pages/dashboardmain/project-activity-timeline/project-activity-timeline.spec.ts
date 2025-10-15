import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectActivityTimelineComponent, ChartData } from './project-activity-timeline';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ProjectActivityTimelineComponent', () => {
  let component: ProjectActivityTimelineComponent;
  let fixture: ComponentFixture<ProjectActivityTimelineComponent>;
  let compiled: HTMLElement;

  const mockChartData: ChartData = {
    monthly: [
      { period: 'Week 1', projects: 15 },
      { period: 'Week 2', projects: 22 },
      { period: 'Week 3', projects: 18 },
      { period: 'Week 4', projects: 25 }
    ],
    quarterly: [
      { period: 'Q1 2024', projects: 45 },
      { period: 'Q2 2024', projects: 65 },
      { period: 'Q3 2024', projects: 52 },
      { period: 'Q4 2024', projects: 78 }
    ],
    yearly: [
      { period: 'Jan', projects: 12 },
      { period: 'Feb', projects: 15 },
      { period: 'Mar', projects: 18 },
      { period: 'Apr', projects: 22 },
      { period: 'May', projects: 20 },
      { period: 'Jun', projects: 25 },
      { period: 'Jul', projects: 28 },
      { period: 'Aug', projects: 30 },
      { period: 'Sep', projects: 27 },
      { period: 'Oct', projects: 32 },
      { period: 'Nov', projects: 35 },
      { period: 'Dec', projects: 37 }
    ],
    last5Years: [
      { period: '2020', projects: 120 },
      { period: '2021', projects: 185 },
      { period: '2022', projects: 220 },
      { period: '2023', projects: 280 },
      { period: '2024', projects: 320 }
    ],
    allTime: [
      { period: '2018', projects: 80 },
      { period: '2019', projects: 95 },
      { period: '2020', projects: 120 },
      { period: '2021', projects: 185 },
      { period: '2022', projects: 220 },
      { period: '2023', projects: 280 },
      { period: '2024', projects: 320 }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectActivityTimelineComponent, NgApexchartsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectActivityTimelineComponent);
    component = fixture.componentInstance;
    component.chartData = mockChartData;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have standalone set to true', () => {
      const metadata = (ProjectActivityTimelineComponent as any).ɵcmp;
      expect(metadata.standalone).toBe(true);
    });

    it('should initialize with Yearly as default period', () => {
      expect(component.selectedPeriod).toBe('Yearly');
    });

    it('should initialize with dropdown closed', () => {
      expect(component.showDropdown).toBe(false);
    });

    it('should have all periods defined', () => {
      expect(component.periods).toEqual(['Monthly', 'Quarterly', 'Yearly', 'Last 5 Years', 'All Time']);
    });

    it('should initialize chart on ngOnInit', () => {
      spyOn<any>(component, 'initializeChart');
      component.ngOnInit();
      expect(component['initializeChart']).toHaveBeenCalled();
    });

    it('should have chart configuration after initialization', () => {
      expect(component.chart).toBeDefined();
      expect(component.chart.series).toBeDefined();
      expect(component.chart.chart).toBeDefined();
    });
  });

  describe('Dropdown Functionality', () => {
    it('should toggle dropdown on button click', () => {
      expect(component.showDropdown).toBe(false);
      component.toggleDropdown();
      expect(component.showDropdown).toBe(true);
      component.toggleDropdown();
      expect(component.showDropdown).toBe(false);
    });

    it('should show dropdown menu when toggled', () => {
      component.showDropdown = true;
      fixture.detectChanges();
      const dropdown = compiled.querySelector('.absolute.right-0');
      expect(dropdown).toBeTruthy();
    });

    it('should hide dropdown menu when not toggled', () => {
      component.showDropdown = false;
      fixture.detectChanges();
      const dropdown = compiled.querySelector('.absolute.right-0');
      expect(dropdown).toBeFalsy();
    });

    it('should display all period options in dropdown', () => {
      component.showDropdown = true;
      fixture.detectChanges();
      const buttons = compiled.querySelectorAll('.absolute button');
      expect(buttons.length).toBe(5);
    });
  });

  describe('Period Selection', () => {
    it('should change selected period when selectPeriod is called', () => {
      component.selectPeriod('Monthly');
      expect(component.selectedPeriod).toBe('Monthly');
    });

    it('should close dropdown after selecting period', () => {
      component.showDropdown = true;
      component.selectPeriod('Quarterly');
      expect(component.showDropdown).toBe(false);
    });

    it('should update chart when period is selected', () => {
      spyOn<any>(component, 'updateChart');
      component.selectPeriod('Monthly');
      expect(component['updateChart']).toHaveBeenCalled();
    });

    it('should update chart data for Monthly period', () => {
      component.selectPeriod('Monthly');
      const data = component['getDataForPeriod']('Monthly');
      expect(data.length).toBe(4);
      expect(data[0].period).toBe('Week 1');
    });

    it('should update chart data for Quarterly period', () => {
      component.selectPeriod('Quarterly');
      const data = component['getDataForPeriod']('Quarterly');
      expect(data.length).toBe(4);
      expect(data[0].period).toBe('Q1 2024');
    });

    it('should update chart data for Yearly period', () => {
      component.selectPeriod('Yearly');
      const data = component['getDataForPeriod']('Yearly');
      expect(data.length).toBe(12);
      expect(data[0].period).toBe('Jan');
    });

    it('should update chart data for Last 5 Years period', () => {
      component.selectPeriod('Last 5 Years');
      const data = component['getDataForPeriod']('Last 5 Years');
      expect(data.length).toBe(5);
      expect(data[0].period).toBe('2020');
    });

    it('should update chart data for All Time period', () => {
      component.selectPeriod('All Time');
      const data = component['getDataForPeriod']('All Time');
      expect(data.length).toBe(7);
      expect(data[0].period).toBe('2018');
    });
  });

  describe('getTotalProjects Method', () => {
    it('should calculate total projects for Yearly period', () => {
      component.selectPeriod('Yearly');
      const total = component.getTotalProjects();
      expect(total).toBe(301); // Sum of yearly data
    });

    it('should calculate total projects for Monthly period', () => {
      component.selectPeriod('Monthly');
      const total = component.getTotalProjects();
      expect(total).toBe(80); // 15+22+18+25
    });

    it('should calculate total projects for Quarterly period', () => {
      component.selectPeriod('Quarterly');
      const total = component.getTotalProjects();
      expect(total).toBe(240); // 45+65+52+78
    });

    it('should calculate total projects for Last 5 Years', () => {
      component.selectPeriod('Last 5 Years');
      const total = component.getTotalProjects();
      expect(total).toBe(1125); // 120+185+220+280+320
    });

    it('should calculate total projects for All Time', () => {
      component.selectPeriod('All Time');
      const total = component.getTotalProjects();
      expect(total).toBe(1300); // 80+95+120+185+220+280+320
    });
  });

  describe('Chart Configuration', () => {
    it('should have correct chart type', () => {
      expect(component.chart.chart.type).toBe('line');
    });

    it('should have correct chart height', () => {
      expect(component.chart.chart.height).toBe(350);
    });

    it('should disable zoom', () => {
      expect(component.chart.chart.zoom.enabled).toBe(false);
    });

    it('should hide toolbar', () => {
      expect(component.chart.chart.toolbar.show).toBe(false);
    });

    it('should enable animations', () => {
      expect(component.chart.chart.animations.enabled).toBe(true);
    });

    it('should have smooth stroke curve', () => {
      expect(component.chart.stroke.curve).toBe('smooth');
    });

    it('should have correct stroke width', () => {
      expect(component.chart.stroke.width).toBe(3);
    });

    it('should have correct stroke color', () => {
      expect(component.chart.stroke.colors).toEqual(['#3B82F6']);
    });

    it('should have correct marker size', () => {
      expect(component.chart.markers.size).toBe(5);
    });

    it('should set yaxis minimum to 0', () => {
      expect(component.chart.yaxis.min).toBe(0);
    });

    it('should have correct yaxis title', () => {
      expect(component.chart.yaxis.title.text).toBe('Active Projects');
    });
  });

  describe('getDataForPeriod Method', () => {
    it('should return Monthly data for Monthly period', () => {
      const data = component['getDataForPeriod']('Monthly');
      expect(data).toEqual([
        { period: 'Week 1', projects: 15 },
        { period: 'Week 2', projects: 22 },
        { period: 'Week 3', projects: 18 },
        { period: 'Week 4', projects: 25 }
      ]);
    });

    it('should return Quarterly data for Quarterly period', () => {
      const data = component['getDataForPeriod']('Quarterly');
      expect(data).toEqual([
        { period: 'Q1 2024', projects: 45 },
        { period: 'Q2 2024', projects: 65 },
        { period: 'Q3 2024', projects: 52 },
        { period: 'Q4 2024', projects: 78 }
      ]);
    });

    it('should return Yearly data for Yearly period', () => {
      const data = component['getDataForPeriod']('Yearly');
      expect(data.length).toBe(12);
      expect(data[0]).toEqual({ period: 'Jan', projects: 12 });
    });

    it('should return Last 5 Years data', () => {
      const data = component['getDataForPeriod']('Last 5 Years');
      expect(data.length).toBe(5);
      expect(data[4]).toEqual({ period: '2024', projects: 320 });
    });

    it('should return All Time data', () => {
      const data = component['getDataForPeriod']('All Time');
      expect(data.length).toBe(7);
      expect(data[0]).toEqual({ period: '2018', projects: 80 });
    });

    it('should return yearly data for unknown period', () => {
      const data = component['getDataForPeriod']('Unknown Period');
      expect(data.length).toBe(12);
      expect(data[0].period).toBe('Jan');
    });
  });

  describe('Template Rendering', () => {
    it('should render component title', () => {
      const title = compiled.querySelector('h3');
      expect(title?.textContent?.trim()).toBe('Project Activity Timeline');
    });

    it('should render component description', () => {
      const description = compiled.querySelector('p.text-sm');
      expect(description?.textContent?.trim()).toBe('Track project creation trends over time');
    });

    it('should render dropdown button with selected period', () => {
      const button = compiled.querySelector('button');
      expect(button?.textContent).toContain('Yearly');
    });

    it('should render chart container', () => {
      const chartContainer = compiled.querySelector('.chart-container');
      expect(chartContainer).toBeTruthy();
    });

    it('should render apx-chart component', () => {
      const apxChart = fixture.debugElement.query(By.css('apx-chart'));
      expect(apxChart).toBeTruthy();
    });

    it('should render summary stats section', () => {
      const summary = compiled.querySelector('.border-t.border-gray-100');
      expect(summary).toBeTruthy();
    });

    it('should display current period in summary', () => {
      const summary = compiled.querySelector('.border-t.border-gray-100');
      expect(summary?.textContent).toContain('Current Period: Yearly');
    });

    it('should display total projects in summary', () => {
      const summary = compiled.querySelector('.border-t.border-gray-100');
      expect(summary?.textContent).toContain('Total:');
      expect(summary?.textContent).toContain('projects');
    });

    it('should update displayed period after selection', () => {
      component.selectPeriod('Monthly');
      fixture.detectChanges();
      const button = compiled.querySelector('button');
      expect(button?.textContent).toContain('Monthly');
    });

    it('should update total projects display after period change', () => {
      component.selectPeriod('Monthly');
      fixture.detectChanges();
      const summary = compiled.querySelector('.font-medium.text-blue-600');
      expect(summary?.textContent).toContain('80');
    });
  });

  describe('Chart Series Data', () => {
    it('should have correct series name', () => {
      expect(component.chart.series[0].name).toBe('Active Projects');
    });

    it('should update series data when period changes', () => {
      component.selectPeriod('Monthly');
      expect(component.chart.series[0].data).toEqual([15, 22, 18, 25]);
    });

    it('should update xaxis categories when period changes', () => {
      component.selectPeriod('Monthly');
      expect(component.chart.xaxis.categories).toEqual(['Week 1', 'Week 2', 'Week 3', 'Week 4']);
    });

    it('should have correct number of data points for Yearly', () => {
      component.selectPeriod('Yearly');
      expect(component.chart.series[0].data.length).toBe(12);
    });

    it('should have correct number of data points for All Time', () => {
      component.selectPeriod('All Time');
      expect(component.chart.series[0].data.length).toBe(7);
    });
  });

  describe('Dropdown Interaction', () => {
    it('should trigger toggleDropdown on button click', () => {
      spyOn(component, 'toggleDropdown');
      const button = compiled.querySelector('button') as HTMLElement;
      button.click();
      expect(component.toggleDropdown).toHaveBeenCalled();
    });

    it('should highlight selected period in dropdown', () => {
      component.showDropdown = true;
      fixture.detectChanges();
      const buttons = compiled.querySelectorAll('.absolute button');
      const yearlyButton = Array.from(buttons).find(btn => 
        btn.textContent?.trim() === 'Yearly'
      ) as HTMLElement;
      expect(yearlyButton?.classList.contains('bg-blue-50')).toBe(true);
      expect(yearlyButton?.classList.contains('text-blue-600')).toBe(true);
    });

    it('should call selectPeriod when dropdown option is clicked', () => {
      spyOn(component, 'selectPeriod');
      component.showDropdown = true;
      fixture.detectChanges();
      const buttons = compiled.querySelectorAll('.absolute button');
      const monthlyButton = Array.from(buttons).find(btn => 
        btn.textContent?.trim() === 'Monthly'
      ) as HTMLElement;
      monthlyButton.click();
      expect(component.selectPeriod).toHaveBeenCalledWith('Monthly');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty chart data gracefully', () => {
      component.chartData = {
        monthly: [],
        quarterly: [],
        yearly: [],
        last5Years: [],
        allTime: []
      };
      component.selectPeriod('Monthly');
      expect(component.getTotalProjects()).toBe(0);
    });

    it('should return 0 for total projects when data is empty', () => {
      const emptyData = component['getDataForPeriod']('Monthly');
      spyOn<any>(component, 'getDataForPeriod').and.returnValue([]);
      component.selectPeriod('Monthly');
      expect(component.getTotalProjects()).toBe(0);
    });

    it('should handle multiple rapid period changes', () => {
      component.selectPeriod('Monthly');
      component.selectPeriod('Quarterly');
      component.selectPeriod('Yearly');
      expect(component.selectedPeriod).toBe('Yearly');
      expect(component.showDropdown).toBe(false);
    });

    it('should maintain chart configuration through period changes', () => {
      component.selectPeriod('Monthly');
      expect(component.chart.chart.type).toBe('line');
      component.selectPeriod('Quarterly');
      expect(component.chart.chart.type).toBe('line');
    });
  });

  describe('Integration', () => {
    it('should update chart and total when selecting different periods', () => {
      component.selectPeriod('Quarterly');
      fixture.detectChanges();
      
      expect(component.selectedPeriod).toBe('Quarterly');
      expect(component.getTotalProjects()).toBe(240);
      expect(component.chart.series[0].data.length).toBe(4);
    });

    it('should complete full user interaction flow', () => {
      // Open dropdown
      component.toggleDropdown();
      expect(component.showDropdown).toBe(true);
      
      // Select period
      component.selectPeriod('Last 5 Years');
      expect(component.showDropdown).toBe(false);
      expect(component.selectedPeriod).toBe('Last 5 Years');
      
      // Verify chart updated
      expect(component.chart.series[0].data.length).toBe(5);
      expect(component.getTotalProjects()).toBe(1125);
    });
  });
});