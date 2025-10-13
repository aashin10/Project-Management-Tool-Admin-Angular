import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';

export interface ActivityData {
  period: string;
  projects: number;
}

export interface ChartData {
  monthly: ActivityData[];
  quarterly: ActivityData[];
  yearly: ActivityData[];
  last5Years: ActivityData[];
  allTime: ActivityData[];
}

@Component({
  selector: 'app-project-activity-timeline',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './project-activity-timeline.html',
  styleUrls: ['./project-activity-timeline.css']
})
export class ProjectActivityTimelineComponent implements OnInit {
  @Input() chartData!: ChartData;

  selectedPeriod: string = 'Yearly';
  showDropdown: boolean = false;
  
  periods: string[] = ['Monthly', 'Quarterly', 'Yearly', 'Last 5 Years', 'All Time'];

  // ApexCharts configuration
  public chart: any;

  ngOnInit() {
    this.initializeChart();
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  selectPeriod(period: string) {
    this.selectedPeriod = period;
    this.showDropdown = false;
    this.updateChart();
  }

  getTotalProjects(): number {
    const data = this.getDataForPeriod(this.selectedPeriod);
    return data.reduce((sum, item) => sum + item.projects, 0);
  }

  private initializeChart() {
    this.updateChart();
  }

  private updateChart() {
    const data = this.getDataForPeriod(this.selectedPeriod);
    
    this.chart = {
      series: [{
        name: 'Active Projects',
        data: data.map(item => item.projects)
      }],
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        },
        toolbar: {
          show: false
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        },
        foreColor: '#6B7280'
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 3,
        colors: ['#3B82F6']
      },
      grid: {
        borderColor: '#F3F4F6',
        strokeDashArray: 4,
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }
      },
      markers: {
        size: 5,
        strokeWidth: 2,
        strokeColors: '#fff',
        hover: {
          size: 7
        }
      },
      xaxis: {
        categories: data.map(item => item.period),
        axisBorder: {
          color: '#E5E7EB'
        },
        axisTicks: {
          color: '#E5E7EB'
        },
        tooltip: {
          enabled: false
        }
      },
      yaxis: {
        title: {
          text: 'Active Projects',
          style: {
            fontSize: '12px',
            fontWeight: 400,
            color: '#6B7280'
          }
        },
        min: 0,
        tickAmount: 5,
        labels: {
          formatter: (value: number) => {
            return Math.floor(value).toString();
          }
        }
      },
      tooltip: {
        theme: 'light',
        style: {
          fontSize: '12px'
        },
        x: {
          show: true,
          formatter: (value: string) => {
            return `${this.selectedPeriod}: ${value}`;
          }
        },
        y: {
          title: {
            formatter: () => 'Projects:'
          },
          formatter: (value: number) => {
            return `${value}`;
          }
        },
        marker: {
          show: true
        }
      },
      colors: ['#3B82F6'],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.3,
          gradientToColors: ['#3B82F6'],
          stops: [0, 100]
        }
      }
    };
  }

  private getDataForPeriod(period: string): ActivityData[] {
    switch (period) {
      case 'Monthly':
        return [
          { period: 'Week 1', projects: 15 },
          { period: 'Week 2', projects: 22 },
          { period: 'Week 3', projects: 18 },
          { period: 'Week 4', projects: 25 }
        ];
      case 'Quarterly':
        return [
          { period: 'Q1 2024', projects: 45 },
          { period: 'Q2 2024', projects: 65 },
          { period: 'Q3 2024', projects: 52 },
          { period: 'Q4 2024', projects: 78 }
        ];
      case 'Yearly':
        return [
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
        ];
      case 'Last 5 Years':
        return [
          { period: '2020', projects: 120 },
          { period: '2021', projects: 185 },
          { period: '2022', projects: 220 },
          { period: '2023', projects: 280 },
          { period: '2024', projects: 320 }
        ];
      case 'All Time':
        return [
          { period: '2018', projects: 80 },
          { period: '2019', projects: 95 },
          { period: '2020', projects: 120 },
          { period: '2021', projects: 185 },
          { period: '2022', projects: 220 },
          { period: '2023', projects: 280 },
          { period: '2024', projects: 320 }
        ];
      default:
        return this.generateYearlyData();
    }
  }

  private generateYearlyData(): ActivityData[] {
    return [
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
    ];
  }
}

// import { CommonModule } from '@angular/common';
// import { Component, Input } from '@angular/core';

// export interface ActivityData {
//   month: string;
//   projects: number;
// }

// @Component({
//   selector: 'app-project-activity-timeline',
//   imports: [CommonModule],
//   templateUrl: './project-activity-timeline.html',
//   styleUrl: './project-activity-timeline.css'
// })
// export class ProjectActivityTimeline {
//   @Input() data: ActivityData[] = [];
  
//   selectedPeriod: string = 'Yearly';
//   showDropdown: boolean = false;
  
//   periods: string[] = ['Monthly', 'Quarterly', 'Yearly', 'Last 5 Years', 'All Time'];

//   toggleDropdown() {
//     this.showDropdown = !this.showDropdown;
//   }

//   selectPeriod(period: string) {
//     this.selectedPeriod = period;
//     this.showDropdown = false;
//   }

//   getMaxValue(): number {
//     return Math.max(...this.data.map(d => d.projects));
//   }

//   getYAxisValues(): number[] {
//     const max = this.getMaxValue();
//     const step = Math.ceil(max / 4 / 10) * 10;
//     return [0, step, step * 2, step * 3, step * 4];
//   }

//   getPointPosition(index: number, value: number): { x: number; y: number } {
//     const chartWidth = 100;
//     const chartHeight = 100;
//     const padding = 5;
    
//     const maxValue = this.getMaxValue();
//     const x = (index / (this.data.length - 1)) * (chartWidth - padding * 2) + padding;
//     const y = chartHeight - ((value / maxValue) * (chartHeight - padding * 2) + padding);
    
//     return { x, y };
//   }

//   getPathData(): string {
//     if (this.data.length === 0) return '';
    
//     let path = '';
//     this.data.forEach((item, index) => {
//       const pos = this.getPointPosition(index, item.projects);
//       if (index === 0) {
//         path += `M ${pos.x} ${pos.y}`;
//       } else {
//         path += ` L ${pos.x} ${pos.y}`;
//       }
//     });
    
//     return path;
//   }
// }