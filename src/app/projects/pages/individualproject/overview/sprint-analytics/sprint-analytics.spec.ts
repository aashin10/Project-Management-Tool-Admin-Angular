import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SprintAnalyticsComponent } from './sprint-analytics';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { By } from '@angular/platform-browser';

describe('SprintAnalyticsComponent', () => {
  let component: SprintAnalyticsComponent;
  let fixture: ComponentFixture<SprintAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SprintAnalyticsComponent,
        CommonModule,
        FormsModule,
        NgApexchartsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SprintAnalyticsComponent);
    component = fixture.componentInstance;

    //  mock input data
    component.currentSprint = {
      id: 'sprint-1',
      name: 'Sprint 1',
      progress: 50,
      goal: 'Implement features',
      startDate: '2025-10-01',
      endDate: '2025-10-14',
      status: 'Active',
      toDo: 5,
      inProgress: 3,
      done: 2,
      completedStoryPoints: 20,
      totalStoryPoints: 50,
      completedIssues: 5,
      issuesCount: 10
    };

    component.sprints = [
      component.currentSprint,
      {
        id: 'sprint-2',
        name: 'Sprint 2',
        progress: 0,
        goal: 'Sprint 2 goals',
        startDate: '2025-10-15',
        endDate: '2025-10-28',
        status: 'Planned',
        toDo: 10,
        inProgress: 0,
        done: 0,
        completedStoryPoints: 0,
        totalStoryPoints: 40,
        completedIssues: 0,
        issuesCount: 8
      }
    ];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Template tests
  it('should display sprint name and statistics in header', () => {
    const headerElement = fixture.debugElement.query(By.css('.analytics-header'));
    const statsText = headerElement.nativeElement.textContent;
    
    expect(statsText).toContain('20/50'); // Story points
    expect(statsText).toContain('5/10'); // Issues
  });

  it('should render all chart type tabs', () => {
    const tabButtons = fixture.debugElement.queryAll(By.css('.tab-button'));
    expect(tabButtons.length).toBe(3);
    expect(tabButtons[0].nativeElement.textContent.trim()).toBe('Burndown');
    expect(tabButtons[1].nativeElement.textContent.trim()).toBe('Burnup');
    expect(tabButtons[2].nativeElement.textContent.trim()).toBe('Velocity');
  });

  it('should display sprint dropdown with all sprints', () => {
    const select = fixture.debugElement.query(By.css('.sprint-select'));
    const options = select.queryAll(By.css('option'));
    expect(options.length).toBe(2);
  });

  it('should show correct progress metrics', () => {
    const metrics = fixture.debugElement.queryAll(By.css('.metric-value'));
    expect(metrics[0].nativeElement.textContent.trim()).toBe('50%'); // Sprint Progress
    expect(metrics[1].nativeElement.textContent.trim()).toBe('40%'); // Story Points Progress
    expect(metrics[2].nativeElement.textContent.trim()).toBe('50%'); // Issues Progress
  });

  // Component class tests
  it('should initialize with default chart type as burndown', () => {
    expect(component.chartType).toBe('burndown');
    expect(component.chartOptions).toBeDefined();
    expect(component.chartOptions.chart.type).toBe('line');
  });

  it('should correctly calculate story points progress', () => {
    const progress = component.getStoryPointsProgress();
    expect(progress).toBe(40); // (20/50) * 100
  });

  it('should correctly calculate issues progress', () => {
    const progress = component.getIssuesProgress();
    expect(progress).toBe(50); // (5/10) * 100
  });

  it('should emit sprint change event when sprint is changed', () => {
    spyOn(component.sprintChange, 'emit');
    component.onSprintChange('sprint-2');
    expect(component.sprintChange.emit).toHaveBeenCalledWith('sprint-2');
  });

  it('should emit export report event', () => {
    spyOn(component.exportReport, 'emit');
    component.handleExportReport();
    expect(component.exportReport.emit).toHaveBeenCalled();
  });

  it('should update chart when chart type changes', () => {
    spyOn(component as any, 'initializeBurnupChart');
    component.setChartType('burnup');
    expect(component.chartType).toBe('burnup');
    expect(component['initializeBurnupChart']).toHaveBeenCalled();
  });

  it('should initialize with correct chart data on ngOnInit', () => {
    component.ngOnInit();
    expect(component.selectedSprint).toBe(component.currentSprint.id);
    expect(component.chartOptions).toBeDefined();
  });

  it('should update chart when current sprint changes', () => {
    spyOn(component as any, 'initializeChart');
    const newSprint = { ...component.currentSprint, id: 'sprint-3' };
    component.currentSprint = newSprint;
    component.ngOnChanges({
      currentSprint: {
        currentValue: newSprint,
        previousValue: component.currentSprint,
        firstChange: false,
        isFirstChange: () => false
      }
    });
    expect(component['initializeChart']).toHaveBeenCalled();
  });

  it('should initialize velocity chart with correct data', () => {
    component.setChartType('velocity');
    expect(component.chartOptions.series[0].data).toEqual([50, 20]); // [totalStoryPoints, completedStoryPoints]
    expect(component.chartOptions.chart.type).toBe('bar');
  });

  // Chart initialization tests
  describe('Chart Initialization', () => {
    it('should initialize burndown chart with correct properties', () => {
      component.setChartType('burndown');
      expect(component.chartOptions.chart.type).toBe('line');
      expect(component.chartOptions.series.length).toBe(2); // Actual and Planned lines
    });

    it('should initialize burnup chart with correct properties', () => {
      component.setChartType('burnup');
      expect(component.chartOptions.chart.type).toBe('area');
      expect(component.chartOptions.series.length).toBe(2); // Completed and Scope lines
    });

    it('should initialize velocity chart with correct properties', () => {
      component.setChartType('velocity');
      expect(component.chartOptions.chart.type).toBe('bar');
      expect(component.chartOptions.series.length).toBe(1); // Single series for story points
    });
  });
});
