import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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
export class ProjectStatusComponent implements OnInit, OnChanges {
  @Input() statusData: ProjectStatusData[] = [];

  deliveryUnits: string[] = [];
  selectedDeliveryUnit: string = 'All Delivery Units';
  chartSegments: PieChartSegment[] = [];
  hoveredSegment: string | null = null;
  totalProjects: number = 0;
  dropdownOpen: boolean = false;

  private readonly colorScheme: Record<StatusType, { base: string; hover: string }> = {
    'Active': { base: '#2563eb', hover: '#1d4ed8' },
    'Completed': { base: '#059669', hover: '#047857' },
    'Inactive': { base: '#f59e0b', hover: '#d97706' }
  };

  ngOnInit() {
    console.log('🎨 ProjectStatusComponent initialized with data:', this.statusData);
    this.initializeData();
    
    // Add click listener to document
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  ngOnDestroy() {
    // Clean up the event listener
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  private handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdownElement = document.querySelector('.dropdown-container');
    
    if (dropdownElement && !dropdownElement.contains(target)) {
      this.dropdownOpen = false;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['statusData'] && !changes['statusData'].firstChange) {
      console.log('🔄 StatusData changed in child component:', changes['statusData'].currentValue);
      this.initializeData();
    }
  }

  private initializeData() {
    if (!this.statusData || this.statusData.length === 0) {
      console.warn('⚠️ No status data available');
      this.deliveryUnits = ['All Delivery Units'];
      this.chartSegments = [];
      this.totalProjects = 0;
      return;
    }

    this.deliveryUnits = this.statusData.map(du => du.deliveryUnit);
    console.log('📋 Available Delivery Units:', this.deliveryUnits);
    
    if (this.deliveryUnits.includes('All Delivery Units')) {
      this.selectedDeliveryUnit = 'All Delivery Units';
    } else if (this.deliveryUnits.length > 0) {
      this.selectedDeliveryUnit = this.deliveryUnits[0];
    }
    
    this.updateChartData();
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  onDeliveryUnitChange(unit: string) {
    console.log('🔄 Delivery unit changed to:', unit);
    this.selectedDeliveryUnit = unit;
    this.dropdownOpen = false;
    this.updateChartData();
  }

  private updateChartData() {
    // Find the selected delivery unit data
    const selectedData = this.statusData.find(du => du.deliveryUnit === this.selectedDeliveryUnit);
    
    if (!selectedData) {
      console.warn('⚠️ No data found for selected delivery unit:', this.selectedDeliveryUnit);
      this.totalProjects = 0;
      this.chartSegments = [];
      return;
    }

    const data = {
      inProgress: selectedData.inProgress,
      completed: selectedData.completed,
      onHold: selectedData.onHold
    };

    console.log(`📊 Chart data for "${this.selectedDeliveryUnit}":`, data);

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
    console.log('🎨 Generated chart segments:', this.chartSegments);
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

    // Special case: if this is a full circle (360 degrees or close to it)
    const angleSize = segment.endAngle - segment.startAngle;
    if (angleSize >= 359.9) {
      // Draw a full circle using two 180-degree arcs
      const top = this.polarToCartesian(centerX, centerY, radius, 0);
      const bottom = this.polarToCartesian(centerX, centerY, radius, 180);
      
      return [
        `M ${centerX} ${centerY}`,
        `L ${top.x} ${top.y}`,
        `A ${radius} ${radius} 0 0 1 ${bottom.x} ${bottom.y}`,
        `A ${radius} ${radius} 0 0 1 ${top.x} ${top.y}`,
        'Z'
      ].join(' ');
    }

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








// import { Component, Input, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';

// export interface ProjectStatusData {
//   deliveryUnit: string;
//   inProgress: number;
//   completed: number;
//   onHold: number;
//   total: number;
// }

// export interface PieChartSegment {
//   status: string;
//   count: number;
//   percentage: number;
//   color: string;
//   hoverColor: string;
//   startAngle: number;
//   endAngle: number;
// }

// type StatusType = 'Active' | 'Completed' | 'Inactive';

// @Component({
//   selector: 'app-project-status',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './project-status-pie.html',
//   styleUrls: ['./project-status-pie.css']
// })
// export class ProjectStatusComponent implements OnInit {
//   @Input() statusData: ProjectStatusData[] = [];

//   deliveryUnits: string[] = [];
//   selectedDeliveryUnit: string = 'All Delivery Units';
//   chartSegments: PieChartSegment[] = [];
//   hoveredSegment: string | null = null;
//   totalProjects: number = 0;
//   dropdownOpen: boolean = false;

//   // Color scheme matching the screenshots
//   private readonly colorScheme: Record<StatusType, { base: string; hover: string }> = {
//     'Active': { base: '#2563eb', hover: '#1d4ed8' },
//     'Completed': { base: '#059669', hover: '#047857' },
//     'Inactive': { base: '#f59e0b', hover: '#d97706' }
//   };

//   ngOnInit() {
//     this.initializeData();
//   }

//   private initializeData() {
//     this.deliveryUnits = ['All Delivery Units', ...this.statusData.map(du => du.deliveryUnit)];
//     this.updateChartData();
//   }

//   toggleDropdown() {
//     this.dropdownOpen = !this.dropdownOpen;
//   }

//   closeDropdown() {
//     this.dropdownOpen = false;
//   }

//   onDeliveryUnitChange(unit: string) {
//     this.selectedDeliveryUnit = unit;
//     this.dropdownOpen = false;
//     this.updateChartData();
//   }

//   private updateChartData() {
//     let data: { inProgress: number; completed: number; onHold: number };
    
//     if (this.selectedDeliveryUnit === 'All Delivery Units') {
//       data = this.statusData.reduce((acc, curr) => ({
//         inProgress: acc.inProgress + curr.inProgress,
//         completed: acc.completed + curr.completed,
//         onHold: acc.onHold + curr.onHold
//       }), { inProgress: 0, completed: 0, onHold: 0 });
//     } else {
//       const selectedData = this.statusData.find(du => du.deliveryUnit === this.selectedDeliveryUnit);
//       data = selectedData || { inProgress: 0, completed: 0, onHold: 0 };
//     }

//     this.totalProjects = data.inProgress + data.completed + data.onHold;
//     this.generateChartSegments(data);
//   }

//   private generateChartSegments(data: { inProgress: number; completed: number; onHold: number }) {
//     const segments: PieChartSegment[] = [];
//     let currentAngle = 0;

//     const statuses: Array<{ status: StatusType; count: number }> = [
//       { status: 'Active', count: data.inProgress },
//       { status: 'Completed', count: data.completed },
//       { status: 'Inactive', count: data.onHold }
//     ];

//     statuses.forEach(item => {
//       if (item.count > 0) {
//         const percentage = (item.count / this.totalProjects) * 100;
//         const angleSize = (percentage / 100) * 360;
        
//         segments.push({
//           status: item.status,
//           count: item.count,
//           percentage: percentage,
//           color: this.colorScheme[item.status].base,
//           hoverColor: this.colorScheme[item.status].hover,
//           startAngle: currentAngle,
//           endAngle: currentAngle + angleSize
//         });

//         currentAngle += angleSize;
//       }
//     });

//     this.chartSegments = segments;
//   }

//   // Convert polar coordinates to cartesian for pie chart
//   private polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
//     const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
//     return {
//       x: centerX + (radius * Math.cos(angleInRadians)),
//       y: centerY + (radius * Math.sin(angleInRadians))
//     };
//   }

//   // Generate SVG path for pie slice
//   getPathData(segment: PieChartSegment, index: number): string {
//     const centerX = 100;
//     const centerY = 100;
//     const radius = 85;

//     const start = this.polarToCartesian(centerX, centerY, radius, segment.endAngle);
//     const end = this.polarToCartesian(centerX, centerY, radius, segment.startAngle);
//     const largeArcFlag = segment.endAngle - segment.startAngle <= 180 ? '0' : '1';

//     return [
//       `M ${centerX} ${centerY}`,
//       `L ${start.x} ${start.y}`,
//       `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
//       'Z'
//     ].join(' ');
//   }

//   // Get line end coordinates for separator lines
//   getLineEndX(segment: PieChartSegment, index: number): number {
//     const angle = segment.endAngle;
//     const angleInRadians = (angle - 90) * Math.PI / 180.0;
//     return 100 + (85 * Math.cos(angleInRadians));
//   }

//   getLineEndY(segment: PieChartSegment, index: number): number {
//     const angle = segment.endAngle;
//     const angleInRadians = (angle - 90) * Math.PI / 180.0;
//     return 100 + (85 * Math.sin(angleInRadians));
//   }

//   onSegmentHover(status: string) {
//     this.hoveredSegment = status;
//   }

//   onSegmentLeave() {
//     this.hoveredSegment = null;
//   }

//   getCurrentSegmentColor(segment: PieChartSegment): string {
//     return this.hoveredSegment === segment.status ? segment.hoverColor : segment.color;
//   }

//   isButtonHovered(status: string): boolean {
//     return this.hoveredSegment === status;
//   }

//   getHoveredSegmentCount(): number {
//     if (!this.hoveredSegment) return 0;
//     const segment = this.chartSegments.find(s => s.status === this.hoveredSegment);
//     return segment ? segment.count : 0;
//   }
// }