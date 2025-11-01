import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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
export class ProjectActivityTimelineComponent implements OnInit, OnChanges {
  @Input() chartData!: ChartData;

  selectedPeriod: string = 'Yearly';
  showDropdown: boolean = false;
  
  periods: string[] = ['Monthly', 'Quarterly', 'Yearly', 'Last 5 Years', 'All Time'];

  // ApexCharts configuration
  public chart: any;

  ngOnInit() {
    console.log('🎨 ProjectActivityTimelineComponent initialized with data:', this.chartData);
    // Initialize chart with data if available
    if (this.chartData) {
      this.initializeChart();
    }
  }

  // CRITICAL FIX: React to data changes including first load
  ngOnChanges(changes: SimpleChanges) {
    if (changes['chartData']) {
      console.log('🔄 ChartData changed in child component:', changes['chartData'].currentValue);
      // Check if this is the first change and chart hasn't been initialized yet
      if (changes['chartData'].firstChange && changes['chartData'].currentValue) {
        console.log('📊 First data load - initializing chart');
        this.initializeChart();
      } else if (!changes['chartData'].firstChange) {
        // Subsequent changes - update chart
        console.log('🔄 Subsequent data change - updating chart');
        this.updateChart();
      }
    }
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
    if (!this.chartData) {
      console.warn('⚠️ No chart data available for initialization');
      return;
    }
    console.log('✅ Initializing chart with data');
    this.updateChart();
  }

  private updateChart() {
    if (!this.chartData) {
      console.warn('⚠️ No chart data available for update');
      return;
    }

    const data = this.getDataForPeriod(this.selectedPeriod);
    
    if (!data || data.length === 0) {
      console.warn('⚠️ No data available for selected period:', this.selectedPeriod);
      return;
    }

    console.log(`📊 Updating chart for period: ${this.selectedPeriod}`, data);
    
    // Calculate max value for consistent y-axis scaling
    const maxValue = data.length > 0 ? Math.max(...data.map(d => d.projects)) : 10;
    const yAxisMax = Math.ceil(maxValue * 1.1); // Add 10% padding
    
    this.chart = {
      series: [{
        name: 'Projects',
        data: data.map(item => item.projects)
      }],
      chart: {
        // FIX 1: Match container height exactly
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
          speed: 800,
          // FIX 2: Disable animation on data update to prevent visual jumps
          dynamicAnimation: {
            enabled: false
          }
        },
        foreColor: '#6B7280',
        // FIX 3: Maintain consistent spacing
        parentHeightOffset: 0
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
        // FIX 4: Fixed padding to prevent height changes
        padding: {
          top: 10,
          right: 10,
          bottom: 10,
          left: 15  // Increased left padding to accommodate y-axis labels
        },
        xaxis: {
          lines: {
            show: true
          }
        },
        yaxis: {
          lines: {
            show: true
          }
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
        },
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Projects Created',
          style: {
            fontSize: '12px',
            fontWeight: 400,
            color: '#6B7280'
          }
        },
        // FIX 5: Set explicit min and max for consistent scale
        min: 0,
        max: yAxisMax > 0 ? yAxisMax : 10,
        tickAmount: 5,
        labels: {
          formatter: (value: number) => {
            return Math.floor(value).toString();
          },
          style: {
            fontSize: '12px'
          },
          // KEY FIX: Reserve fixed width for y-axis labels to prevent truncation
          minWidth: 50,
          maxWidth: 50
        },
        // FIX 6: Prevent y-axis from floating
        forceNiceScale: false,
        decimalsInFloat: 0
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
    if (!this.chartData) {
      console.warn('⚠️ No chartData available');
      return [];
    }

    switch (period) {
      case 'Monthly':
        return this.chartData.monthly || [];
      case 'Quarterly':
        return this.chartData.quarterly || [];
      case 'Yearly':
        return this.chartData.yearly || [];
      case 'Last 5 Years':
        return this.chartData.last5Years || [];
      case 'All Time':
        return this.chartData.allTime || [];
      default:
        return this.chartData.yearly || [];
    }
  }
}








// import { CommonModule } from '@angular/common';
// import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
// import { NgApexchartsModule } from 'ng-apexcharts';

// export interface ActivityData {
//   period: string;
//   projects: number;
// }

// export interface ChartData {
//   monthly: ActivityData[];
//   quarterly: ActivityData[];
//   yearly: ActivityData[];
//   last5Years: ActivityData[];
//   allTime: ActivityData[];
// }

// @Component({
//   selector: 'app-project-activity-timeline',
//   standalone: true,
//   imports: [CommonModule, NgApexchartsModule],
//   templateUrl: './project-activity-timeline.html',
//   styleUrls: ['./project-activity-timeline.css']
// })
// export class ProjectActivityTimelineComponent implements OnInit, OnChanges {
//   @Input() chartData!: ChartData;

//   selectedPeriod: string = 'Yearly';
//   showDropdown: boolean = false;
  
//   periods: string[] = ['Monthly', 'Quarterly', 'Yearly', 'Last 5 Years', 'All Time'];

//   // ApexCharts configuration
//   public chart: any;

//   ngOnInit() {
//     this.initializeChart();
//   }

//   // KEY FIX: Detect when chartData changes and update the chart
//   ngOnChanges(changes: SimpleChanges) {
//     if (changes['chartData'] && !changes['chartData'].firstChange) {
//       this.updateChart();
//     }
//   }

//   toggleDropdown() {
//     this.showDropdown = !this.showDropdown;
//   }

//   selectPeriod(period: string) {
//     this.selectedPeriod = period;
//     this.showDropdown = false;
//     this.updateChart();
//   }

//   getTotalProjects(): number {
//     const data = this.getDataForPeriod(this.selectedPeriod);
//     return data.reduce((sum, item) => sum + item.projects, 0);
//   }

//   private initializeChart() {
//     this.updateChart();
//   }

//   private updateChart() {
//     const data = this.getDataForPeriod(this.selectedPeriod);
    
//     // Calculate max value for consistent y-axis scaling
//     const maxValue = data.length > 0 ? Math.max(...data.map(d => d.projects)) : 10;
//     const yAxisMax = Math.ceil(maxValue * 1.1); // Add 10% padding
    
//     this.chart = {
//       series: [{
//         name: 'Projects',
//         data: data.map(item => item.projects)
//       }],
//       chart: {
//         // FIX 1: Match container height exactly
//         height: 350,
//         type: 'line',
//         zoom: {
//           enabled: false
//         },
//         toolbar: {
//           show: false
//         },
//         animations: {
//           enabled: true,
//           easing: 'easeinout',
//           speed: 800,
//           // FIX 2: Disable animation on data update to prevent visual jumps
//           dynamicAnimation: {
//             enabled: false
//           }
//         },
//         foreColor: '#6B7280',
//         // FIX 3: Maintain consistent spacing
//         parentHeightOffset: 0
//       },
//       dataLabels: {
//         enabled: false
//       },
//       stroke: {
//         curve: 'smooth',
//         width: 3,
//         colors: ['#3B82F6']
//       },
//       grid: {
//         borderColor: '#F3F4F6',
//         strokeDashArray: 4,
//         // FIX 4: Fixed padding to prevent height changes
//         padding: {
//           top: 10,
//           right: 10,
//           bottom: 10,
//           left: 10
//         },
//         xaxis: {
//           lines: {
//             show: true
//           }
//         },
//         yaxis: {
//           lines: {
//             show: true
//           }
//         }
//       },
//       markers: {
//         size: 5,
//         strokeWidth: 2,
//         strokeColors: '#fff',
//         hover: {
//           size: 7
//         }
//       },
//       xaxis: {
//         categories: data.map(item => item.period),
//         axisBorder: {
//           color: '#E5E7EB'
//         },
//         axisTicks: {
//           color: '#E5E7EB'
//         },
//         tooltip: {
//           enabled: false
//         },
//         labels: {
//           style: {
//             fontSize: '12px'
//           }
//         }
//       },
//       yaxis: {
//         title: {
//           text: 'Projects Created',
//           style: {
//             fontSize: '12px',
//             fontWeight: 400,
//             color: '#6B7280'
//           }
//         },
//         // FIX 5: Set explicit min and max for consistent scale
//         min: 0,
//         max: yAxisMax > 0 ? yAxisMax : 10,
//         tickAmount: 5,
//         labels: {
//           formatter: (value: number) => {
//             return Math.floor(value).toString();
//           },
//           style: {
//             fontSize: '12px'
//           }
//         },
//         // FIX 6: Prevent y-axis from floating
//         forceNiceScale: false,
//         decimalsInFloat: 0
//       },
//       tooltip: {
//         theme: 'light',
//         style: {
//           fontSize: '12px'
//         },
//         x: {
//           show: true,
//           formatter: (value: string) => {
//             return `${this.selectedPeriod}: ${value}`;
//           }
//         },
//         y: {
//           title: {
//             formatter: () => 'Projects:'
//           },
//           formatter: (value: number) => {
//             return `${value}`;
//           }
//         },
//         marker: {
//           show: true
//         }
//       },
//       colors: ['#3B82F6'],
//       fill: {
//         type: 'gradient',
//         gradient: {
//           shade: 'light',
//           type: 'vertical',
//           shadeIntensity: 0.3,
//           gradientToColors: ['#3B82F6'],
//           stops: [0, 100]
//         }
//       }
//     };
//   }

//   private getDataForPeriod(period: string): ActivityData[] {
//     if (!this.chartData) return [];

//     switch (period) {
//       case 'Monthly':
//         return this.chartData.monthly || [];
//       case 'Quarterly':
//         return this.chartData.quarterly || [];
//       case 'Yearly':
//         return this.chartData.yearly || [];
//       case 'Last 5 Years':
//         return this.chartData.last5Years || [];
//       case 'All Time':
//         return this.chartData.allTime || [];
//       default:
//         return this.chartData.yearly || [];
//     }
//   }

//   private generateYearlyData(): ActivityData[] {
//     return [
//       { period: 'Jan', projects: 12 },
//       { period: 'Feb', projects: 15 },
//       { period: 'Mar', projects: 18 },
//       { period: 'Apr', projects: 22 },
//       { period: 'May', projects: 20 },
//       { period: 'Jun', projects: 25 },
//       { period: 'Jul', projects: 28 },
//       { period: 'Aug', projects: 30 },
//       { period: 'Sep', projects: 27 },
//       { period: 'Oct', projects: 32 },
//       { period: 'Nov', projects: 35 },
//       { period: 'Dec', projects: 37 }
//     ];
//   }
// }




















// import { CommonModule } from '@angular/common';
// import { Component, Input, OnInit } from '@angular/core';
// import { NgApexchartsModule } from 'ng-apexcharts';

// export interface ActivityData {
//   period: string;
//   projects: number;
// }

// export interface ChartData {
//   monthly: ActivityData[];
//   quarterly: ActivityData[];
//   yearly: ActivityData[];
//   last5Years: ActivityData[];
//   allTime: ActivityData[];
// }

// @Component({
//   selector: 'app-project-activity-timeline',
//   standalone: true,
//   imports: [CommonModule, NgApexchartsModule],
//   templateUrl: './project-activity-timeline.html',
//   styleUrls: ['./project-activity-timeline.css']
// })
// export class ProjectActivityTimelineComponent implements OnInit {
//   @Input() chartData!: ChartData;

//   selectedPeriod: string = 'Yearly';
//   showDropdown: boolean = false;
  
//   periods: string[] = ['Monthly', 'Quarterly', 'Yearly', 'Last 5 Years', 'All Time'];

//   // ApexCharts configuration
//   public chart: any;

//   ngOnInit() {
//     this.initializeChart();
//   }

//   toggleDropdown() {
//     this.showDropdown = !this.showDropdown;
//   }

//   selectPeriod(period: string) {
//     this.selectedPeriod = period;
//     this.showDropdown = false;
//     this.updateChart();
//   }

//   getTotalProjects(): number {
//     const data = this.getDataForPeriod(this.selectedPeriod);
//     return data.reduce((sum, item) => sum + item.projects, 0);
//   }

//   private initializeChart() {
//     this.updateChart();
//   }

//   private updateChart() {
//     const data = this.getDataForPeriod(this.selectedPeriod);
    
//     this.chart = {
//       series: [{
//         name: 'Projects',
//         data: data.map(item => item.projects)
//       }],
//       chart: {
//         height: 350,
//         type: 'line',
//         zoom: {
//           enabled: false
//         },
//         toolbar: {
//           show: false
//         },
//         animations: {
//           enabled: true,
//           easing: 'easeinout',
//           speed: 800
//         },
//         foreColor: '#6B7280'
//       },
//       dataLabels: {
//         enabled: false
//       },
//       stroke: {
//         curve: 'smooth',
//         width: 3,
//         colors: ['#3B82F6']
//       },
//       grid: {
//         borderColor: '#F3F4F6',
//         strokeDashArray: 4,
//         padding: {
//           top: 0,
//           right: 0,
//           bottom: 0,
//           left: 0
//         }
//       },
//       markers: {
//         size: 5,
//         strokeWidth: 2,
//         strokeColors: '#fff',
//         hover: {
//           size: 7
//         }
//       },
//       xaxis: {
//         categories: data.map(item => item.period),
//         axisBorder: {
//           color: '#E5E7EB'
//         },
//         axisTicks: {
//           color: '#E5E7EB'
//         },
//         tooltip: {
//           enabled: false
//         }
//       },
//       yaxis: {
//         title: {
//           text: 'Projects Created',
//           style: {
//             fontSize: '12px',
//             fontWeight: 400,
//             color: '#6B7280'
//           }
//         },
//         min: 0,
//         tickAmount: 5,
//         labels: {
//           formatter: (value: number) => {
//             return Math.floor(value).toString();
//           }
//         }
//       },
//       tooltip: {
//         theme: 'light',
//         style: {
//           fontSize: '12px'
//         },
//         x: {
//           show: true,
//           formatter: (value: string) => {
//             return `${this.selectedPeriod}: ${value}`;
//           }
//         },
//         y: {
//           title: {
//             formatter: () => 'Projects:'
//           },
//           formatter: (value: number) => {
//             return `${value}`;
//           }
//         },
//         marker: {
//           show: true
//         }
//       },
//       colors: ['#3B82F6'],
//       fill: {
//         type: 'gradient',
//         gradient: {
//           shade: 'light',
//           type: 'vertical',
//           shadeIntensity: 0.3,
//           gradientToColors: ['#3B82F6'],
//           stops: [0, 100]
//         }
//       }
//     };
//   }

//   private getDataForPeriod(period: string): ActivityData[] {
//   if (!this.chartData) return [];

//   switch (period) {
//     case 'Monthly':
//       return this.chartData.monthly || [];
//     case 'Quarterly':
//       return this.chartData.quarterly || [];
//     case 'Yearly':
//       return this.chartData.yearly || [];
//     case 'Last 5 Years':
//       return this.chartData.last5Years || [];
//     case 'All Time':
//       return this.chartData.allTime || [];
//     default:
//       return this.chartData.yearly || [];
//   }
// }



//   private generateYearlyData(): ActivityData[] {
//     return [
//       { period: 'Jan', projects: 12 },
//       { period: 'Feb', projects: 15 },
//       { period: 'Mar', projects: 18 },
//       { period: 'Apr', projects: 22 },
//       { period: 'May', projects: 20 },
//       { period: 'Jun', projects: 25 },
//       { period: 'Jul', projects: 28 },
//       { period: 'Aug', projects: 30 },
//       { period: 'Sep', projects: 27 },
//       { period: 'Oct', projects: 32 },
//       { period: 'Nov', projects: 35 },
//       { period: 'Dec', projects: 37 }
//     ];
//   }
// }
