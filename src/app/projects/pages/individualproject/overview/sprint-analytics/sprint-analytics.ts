import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

@Component({
  selector: 'app-sprint-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sprint-analytics.html',
  styleUrls: ['./sprint-analytics.css']
})
export class SprintAnalyticsComponent implements OnInit {
  @Input() currentSprint!: IndividualSprintData;
  @Input() sprints: IndividualSprintData[] = [];
  @Output() sprintChange = new EventEmitter<string>();
  @Output() exportReport = new EventEmitter<void>();

  @ViewChild('burndownChart', { static: false }) burndownChartRef!: ElementRef;
  @ViewChild('burnupChart', { static: false }) burnupChartRef!: ElementRef;
  @ViewChild('velocityChart', { static: false }) velocityChartRef!: ElementRef;

  selectedSprint: string = '';
  chartType: 'burndown' | 'burnup' | 'velocity' = 'burndown';
  
  chartTypes: ChartType[] = [
    { value: 'burndown', label: 'Burndown' },
    { value: 'burnup', label: 'Burnup' },
    { value: 'velocity', label: 'Velocity' }
  ];

  // Sample chart data - in real app, this would come from a service
  burndownData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'],
    ideal: [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0],
    actual: [100, 95, 88, 82, 75, 65, 58, 45, 32, 18, 5]
  };

  burnupData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'],
    completed: [5, 12, 20, 28, 35, 45, 52, 65, 78, 85],
    scope: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
  };

  velocityData = {
    labels: ['Sprint 8', 'Sprint 9', 'Sprint 10', 'Sprint 11', 'Sprint 12'],
    velocity: [32, 28, 35, 30, 34]
  };

  ngOnInit() {
    this.selectedSprint = this.currentSprint.id;
    // Initialize charts after view is ready
    setTimeout(() => {
      this.initializeCharts();
    });
  }

  onSprintChange(sprintId: string) {
    this.sprintChange.emit(sprintId);
    // In a real app, you would fetch new data for the selected sprint
    console.log('Sprint changed to:', sprintId);
  }

  handleExportReport() {
    this.exportReport.emit();
    // In a real app, this would trigger report generation
    console.log('Export report clicked');
  }

  setChartType(type: 'burndown' | 'burnup' | 'velocity') {
    this.chartType = type;
    // Re-initialize chart when type changes
    setTimeout(() => {
      this.initializeCharts();
    });
  }

  private initializeCharts() {
    // This is a placeholder for chart initialization
    // In a real application, you would integrate with Chart.js, ngx-charts, etc.
    console.log('Initializing chart:', this.chartType);
    
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
    // Placeholder for burndown chart initialization
    const canvas = this.burndownChartRef?.nativeElement;
    if (canvas) {
      this.drawPlaceholderChart(canvas, 'Burndown Chart', '#3B82F6');
    }
  }

  private initializeBurnupChart() {
    // Placeholder for burnup chart initialization
    const canvas = this.burnupChartRef?.nativeElement;
    if (canvas) {
      this.drawPlaceholderChart(canvas, 'Burnup Chart', '#10B981');
    }
  }

  private initializeVelocityChart() {
    // Placeholder for velocity chart initialization
    const canvas = this.velocityChartRef?.nativeElement;
    if (canvas) {
      this.drawPlaceholderChart(canvas, 'Velocity Chart', '#8B5CF6');
    }
  }

  private drawPlaceholderChart(canvas: HTMLCanvasElement, title: string, color: string) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw placeholder text
    ctx.fillStyle = '#6B7280';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, canvas.height / 2);
    
    // Draw a simple line chart placeholder
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(canvas.width - 50, canvas.height - 50);
    ctx.stroke();
  }

  // Calculate progress percentage for display
  getStoryPointsProgress(): number {
    return (this.currentSprint.completedStoryPoints / this.currentSprint.totalStoryPoints) * 100;
  }

  getIssuesProgress(): number {
    return (this.currentSprint.completedIssues / this.currentSprint.issuesCount) * 100;
  }
}