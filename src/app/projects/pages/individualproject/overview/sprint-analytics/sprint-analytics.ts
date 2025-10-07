import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexDataLabels,
  ApexLegend,
  ApexTitleSubtitle,
  ApexFill,
  ApexTooltip,
  ApexGrid,
  ApexPlotOptions
} from 'ng-apexcharts';

export interface IndividualSprintData {
  id: string;
  name: string;
  progress: number;
  goal: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Completed' | 'Planned';
  toDo: number;
  inProgress: number;
  done: number;
  completedStoryPoints: number;
  totalStoryPoints: number;
  completedIssues: number;
  issuesCount: number;
}

export interface ChartType {
  value: 'burndown' | 'burnup' | 'velocity';
  label: string;
}

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  title?: ApexTitleSubtitle;
  fill: ApexFill;
  tooltip: ApexTooltip;
  grid: ApexGrid;
  colors: string[];
  plotOptions?: ApexPlotOptions ; // ✅ made optional
};

@Component({
  selector: 'app-sprint-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './sprint-analytics.html',
  styleUrls: ['./sprint-analytics.css']
})
export class SprintAnalyticsComponent implements OnInit, OnChanges {
  @Input() currentSprint!: IndividualSprintData;
  @Input() sprints: IndividualSprintData[] = [];
  @Output() sprintChange = new EventEmitter<string>();
  @Output() exportReport = new EventEmitter<void>();

  selectedSprint: string = '';
  chartType: 'burndown' | 'burnup' | 'velocity' = 'burndown';

  chartTypes: ChartType[] = [
    { value: 'burndown', label: 'Burndown' },
    { value: 'burnup', label: 'Burnup' },
    { value: 'velocity', label: 'Velocity' }
  ];

  public chartOptions!: ChartOptions;

  // Sample data
  private burndownData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Day 11', 'Day 12', 'Day 13'],
    ideal: [50, 46, 42, 38, 35, 31, 27, 23, 19, 15, 12, 8, 4, 0],
    actual: [50, 48, 45, 40, 38, 35, 30, 28, 22, 18, 15, 10, 5, 3]
  };

  private burnupData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Day 11', 'Day 12', 'Day 13'],
    completed: [2, 5, 10, 12, 15, 20, 22, 28, 32, 35, 40, 45, 47],
    scope: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50]
  };

  ngOnInit() {
    this.selectedSprint = this.currentSprint.id;
    this.initializeChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentSprint'] && !changes['currentSprint'].firstChange) {
      this.initializeChart();
    }
  }

  onSprintChange(sprintId: string) {
    this.sprintChange.emit(sprintId);
  }

  handleExportReport() {
    this.exportReport.emit();
  }

  setChartType(type: 'burndown' | 'burnup' | 'velocity') {
    this.chartType = type;
    this.initializeChart();
  }

  private initializeChart() {
    switch (this.chartType) {
      case 'burndown':
        this.initializeBurndownChart();
        break;
      case 'burnup':
        this.initializeBurnupChart();
        break;
      case 'velocity':
        this.initializeVelocityChart();
        break;
    }
  }

  private initializeBurndownChart() {
    this.chartOptions = {
      series: [
        { name: 'Actual', data: this.burndownData.actual },
        { name: 'Planned', data: this.burndownData.ideal }
      ],
      chart: {
        type: 'line',
        height: 200,
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      stroke: { curve: 'smooth', width: [3, 2], dashArray: [0, 5] },
      colors: ['#10B981', '#94A3B8'],
      xaxis: {
        categories: this.burndownData.labels,
        labels: { style: { fontSize: '11px', colors: '#64748B' } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        min: 0,
        labels: { style: { fontSize: '11px', colors: '#64748B' } }
      },
      dataLabels: { enabled: false },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '12px',
        markers: { offsetX: 0, offsetY: 0 }
      },
      fill: { opacity: 1 },
      tooltip: {
        shared: true,
        intersect: false,
        y: { formatter: (val) => val + ' pts' }
      },
      grid: {
        borderColor: '#E5E7EB',
        strokeDashArray: 3,
        xaxis: { lines: { show: false } }
      },
      plotOptions: {}
    };
  }

  private initializeBurnupChart() {
    this.chartOptions = {
      series: [
        { name: 'Completed', data: this.burnupData.completed },
        { name: 'Scope', data: this.burnupData.scope }
      ],
      chart: {
        type: 'area',
        height: 200,
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      stroke: { curve: 'smooth', width: 3 },
      colors: ['#10B981', '#F59E0B'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 0.4,
          opacityFrom: 0.5,
          opacityTo: 0.1,
          stops: [0, 90, 100]
        }
      },
      xaxis: {
        categories: this.burnupData.labels,
        labels: { style: { fontSize: '11px', colors: '#64748B' } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        min: 0,
        labels: { style: { fontSize: '11px', colors: '#64748B' } }
      },
      dataLabels: { enabled: false },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '12px',
        markers: { offsetX: 0, offsetY: 0 }
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: { formatter: (val) => val + ' pts' }
      },
      grid: {
        borderColor: '#E5E7EB',
        strokeDashArray: 3,
        xaxis: { lines: { show: false } }
      }
    };
  }

  private initializeVelocityChart() {
    const planned = this.currentSprint.totalStoryPoints;
    const completed = this.currentSprint.completedStoryPoints;

    this.chartOptions = {
      series: [
        { name: 'Story Points', data: [planned, completed] }
      ],
      chart: {
        type: 'bar',
        height: 200,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '45%',
          borderRadius: 4
        }
      },
      colors: ['#8B5CF6', '#10B981'],
      xaxis: {
        categories: ['Planned', 'Completed'],
        labels: { style: { fontSize: '12px', colors: '#64748B', fontWeight: 500 } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: { style: { fontSize: '11px', colors: '#64748B' } }
      },
      dataLabels: {
        enabled: true,
        style: { fontSize: '12px', fontWeight: 600, colors: ['#1F2937'] },
        offsetY: -20
      },
      stroke: { show: false },
      fill: { opacity: 1 },
      legend: { show: false },
      tooltip: {
        y: { formatter: (val) => val + ' points' }
      },
      grid: {
        borderColor: '#E5E7EB',
        strokeDashArray: 3,
        xaxis: { lines: { show: false } }
      }
    };
  }

  getStoryPointsProgress(): number {
    return (this.currentSprint.completedStoryPoints / this.currentSprint.totalStoryPoints) * 100;
  }

  getIssuesProgress(): number {
    return (this.currentSprint.completedIssues / this.currentSprint.issuesCount) * 100;
  }
}


