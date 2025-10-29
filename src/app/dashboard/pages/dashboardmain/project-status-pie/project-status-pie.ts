import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ProjectStatusData {
  deliveryUnit: string;
  inProgress: number;
  completed: number;
  onHold: number;
  total: number;
}

export interface PieChartSegment {
  status: string;
  count: number;
  percentage: number;
  color: string;
  hoverColor: string;
  startAngle: number;
  endAngle: number;
}

type StatusType = 'Active' | 'Completed' | 'Inactive';

@Component({
  selector: 'app-project-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-status-pie.html',
  styleUrls: ['./project-status-pie.css']
})
export class ProjectStatusComponent implements OnInit {
  @Input() statusData: ProjectStatusData[] = [];

  deliveryUnits: string[] = [];
  selectedDeliveryUnit: string = 'All Delivery Units';
  chartSegments: PieChartSegment[] = [];
  hoveredSegment: string | null = null;
  totalProjects: number = 0;
  dropdownOpen: boolean = false;

  // Color scheme matching the screenshots
  private readonly colorScheme: Record<StatusType, { base: string; hover: string }> = {
    'Active': { base: '#2563eb', hover: '#1d4ed8' },
    'Completed': { base: '#059669', hover: '#047857' },
    'Inactive': { base: '#f59e0b', hover: '#d97706' }
  };

  ngOnInit() {
    this.initializeData();
  }

  private initializeData() {
    this.deliveryUnits = ['All Delivery Units', ...this.statusData.map(du => du.deliveryUnit)];
    this.updateChartData();
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  onDeliveryUnitChange(unit: string) {
    this.selectedDeliveryUnit = unit;
    this.dropdownOpen = false;
    this.updateChartData();
  }

  private updateChartData() {
    let data: { inProgress: number; completed: number; onHold: number };
    
    if (this.selectedDeliveryUnit === 'All Delivery Units') {
      data = this.statusData.reduce((acc, curr) => ({
        inProgress: acc.inProgress + curr.inProgress,
        completed: acc.completed + curr.completed,
        onHold: acc.onHold + curr.onHold
      }), { inProgress: 0, completed: 0, onHold: 0 });
    } else {
      const selectedData = this.statusData.find(du => du.deliveryUnit === this.selectedDeliveryUnit);
      data = selectedData || { inProgress: 0, completed: 0, onHold: 0 };
    }

    this.totalProjects = data.inProgress + data.completed + data.onHold;
    this.generateChartSegments(data);
  }

  private generateChartSegments(data: { inProgress: number; completed: number; onHold: number }) {
    const segments: PieChartSegment[] = [];
    let currentAngle = 0;

    const statuses: Array<{ status: StatusType; count: number }> = [
      { status: 'Active', count: data.inProgress },
      { status: 'Completed', count: data.completed },
      { status: 'Inactive', count: data.onHold }
    ];

    statuses.forEach(item => {
      if (item.count > 0) {
        const percentage = (item.count / this.totalProjects) * 100;
        const angleSize = (percentage / 100) * 360;
        
        segments.push({
          status: item.status,
          count: item.count,
          percentage: percentage,
          color: this.colorScheme[item.status].base,
          hoverColor: this.colorScheme[item.status].hover,
          startAngle: currentAngle,
          endAngle: currentAngle + angleSize
        });

        currentAngle += angleSize;
      }
    });

    this.chartSegments = segments;
  }

  // Convert polar coordinates to cartesian for pie chart
  private polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  // Generate SVG path for pie slice
  getPathData(segment: PieChartSegment, index: number): string {
    const centerX = 100;
    const centerY = 100;
    const radius = 85;

    const start = this.polarToCartesian(centerX, centerY, radius, segment.endAngle);
    const end = this.polarToCartesian(centerX, centerY, radius, segment.startAngle);
    const largeArcFlag = segment.endAngle - segment.startAngle <= 180 ? '0' : '1';

    return [
      `M ${centerX} ${centerY}`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
      'Z'
    ].join(' ');
  }

  // Get line end coordinates for separator lines
  getLineEndX(segment: PieChartSegment, index: number): number {
    const angle = segment.endAngle;
    const angleInRadians = (angle - 90) * Math.PI / 180.0;
    return 100 + (85 * Math.cos(angleInRadians));
  }

  getLineEndY(segment: PieChartSegment, index: number): number {
    const angle = segment.endAngle;
    const angleInRadians = (angle - 90) * Math.PI / 180.0;
    return 100 + (85 * Math.sin(angleInRadians));
  }

  onSegmentHover(status: string) {
    this.hoveredSegment = status;
  }

  onSegmentLeave() {
    this.hoveredSegment = null;
  }

  getCurrentSegmentColor(segment: PieChartSegment): string {
    return this.hoveredSegment === segment.status ? segment.hoverColor : segment.color;
  }

  isButtonHovered(status: string): boolean {
    return this.hoveredSegment === status;
  }

  getHoveredSegmentCount(): number {
    if (!this.hoveredSegment) return 0;
    const segment = this.chartSegments.find(s => s.status === this.hoveredSegment);
    return segment ? segment.count : 0;
  }
}