import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardMainComponent } from './dashboardmain';
import { DashboardMetricCards } from './dashboard-metric-cards/dashboard-metric-cards';
import { ProjectActivityTimelineComponent } from './project-activity-timeline/project-activity-timeline';
import { ProjectStatusComponent } from './project-status-pie/project-status-pie';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('DashboardMainComponent', () => {
  let component: DashboardMainComponent;
  let fixture: ComponentFixture<DashboardMainComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardMainComponent,
        DashboardMetricCards,
        ProjectActivityTimelineComponent,
        ProjectStatusComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardMainComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have standalone set to true', () => {
      const metadata = (DashboardMainComponent as any).ɵcmp;
      expect(metadata.standalone).toBe(true);
    });
  });

  describe('MetricCards Data', () => {
    it('should initialize metricCards array with 4 cards', () => {
      expect(component.metricCards).toBeDefined();
      expect(component.metricCards.length).toBe(4);
    });

    it('should have correct Total Projects card data', () => {
      const totalProjectsCard = component.metricCards[0];
      expect(totalProjectsCard.title).toBe('Total Projects');
      expect(totalProjectsCard.value).toBe(37);
      expect(totalProjectsCard.icon).toBe('/images/dashboard-card1.svg');
      expect(totalProjectsCard.iconBgColor).toBe('bg-blue-50');
      expect(totalProjectsCard.iconColor).toBe('text-blue-600');
      expect(totalProjectsCard.borderColor).toBe('border-blue-100');
    });

    it('should have correct In Progress card data', () => {
      const inProgressCard = component.metricCards[1];
      expect(inProgressCard.title).toBe('In Progress');
      expect(inProgressCard.value).toBe(18);
      expect(inProgressCard.icon).toBe('/images/dashboard-card2.svg');
      expect(inProgressCard.iconBgColor).toBe('bg-emerald-50');
      expect(inProgressCard.iconColor).toBe('text-emerald-600');
      expect(inProgressCard.borderColor).toBe('border-emerald-100');
    });

    it('should have correct On Hold Projects card data', () => {
      const onHoldCard = component.metricCards[2];
      expect(onHoldCard.title).toBe('On Hold Projects');
      expect(onHoldCard.value).toBe(5);
      expect(onHoldCard.icon).toBe('/images/dashboard-card3.svg');
      expect(onHoldCard.iconBgColor).toBe('bg-amber-50');
      expect(onHoldCard.iconColor).toBe('text-amber-600');
      expect(onHoldCard.borderColor).toBe('border-amber-100');
    });

    it('should have correct Delivery Units card data', () => {
      const deliveryUnitsCard = component.metricCards[3];
      expect(deliveryUnitsCard.title).toBe('Delivery Units');
      expect(deliveryUnitsCard.value).toBe(5);
      expect(deliveryUnitsCard.icon).toBe('/images/dashboard-card4.svg');
      expect(deliveryUnitsCard.iconBgColor).toBe('bg-purple-50');
      expect(deliveryUnitsCard.iconColor).toBe('text-purple-600');
      expect(deliveryUnitsCard.borderColor).toBe('border-purple-100');
    });

    it('should have all metric cards with required properties', () => {
      component.metricCards.forEach(card => {
        expect(card.title).toBeDefined();
        expect(card.value).toBeDefined();
        expect(card.icon).toBeDefined();
        expect(card.iconBgColor).toBeDefined();
        expect(card.iconColor).toBeDefined();
        expect(card.borderColor).toBeDefined();
      });
    });
  });

  describe('Project Status Data', () => {
    it('should initialize projectStatusData array with 5 delivery units', () => {
      expect(component.projectStatusData).toBeDefined();
      expect(component.projectStatusData.length).toBe(5);
    });

    it('should have correct Engineering delivery unit data', () => {
      const engineering = component.projectStatusData[0];
      expect(engineering.deliveryUnit).toBe('Engineering');
      expect(engineering.inProgress).toBe(8);
      expect(engineering.completed).toBe(6);
      expect(engineering.onHold).toBe(2);
      expect(engineering.total).toBe(16);
    });

    it('should have correct Design delivery unit data', () => {
      const design = component.projectStatusData[1];
      expect(design.deliveryUnit).toBe('Design');
      expect(design.inProgress).toBe(4);
      expect(design.completed).toBe(3);
      expect(design.onHold).toBe(1);
      expect(design.total).toBe(8);
    });

    it('should have correct Product delivery unit data', () => {
      const product = component.projectStatusData[2];
      expect(product.deliveryUnit).toBe('Product');
      expect(product.inProgress).toBe(3);
      expect(product.completed).toBe(2);
      expect(product.onHold).toBe(1);
      expect(product.total).toBe(6);
    });

    it('should have correct Quality Assurance delivery unit data', () => {
      const qa = component.projectStatusData[3];
      expect(qa.deliveryUnit).toBe('Quality Assurance');
      expect(qa.inProgress).toBe(2);
      expect(qa.completed).toBe(2);
      expect(qa.onHold).toBe(1);
      expect(qa.total).toBe(5);
    });

    it('should have correct DevOps delivery unit data', () => {
      const devops = component.projectStatusData[4];
      expect(devops.deliveryUnit).toBe('DevOps');
      expect(devops.inProgress).toBe(1);
      expect(devops.completed).toBe(1);
      expect(devops.onHold).toBe(0);
      expect(devops.total).toBe(2);
    });

    it('should have total matching sum of individual statuses', () => {
      component.projectStatusData.forEach(unit => {
        const calculatedTotal = unit.inProgress + unit.completed + unit.onHold;
        expect(unit.total).toBe(calculatedTotal);
      });
    });

    it('should have all delivery units with required properties', () => {
      component.projectStatusData.forEach(unit => {
        expect(unit.deliveryUnit).toBeDefined();
        expect(unit.inProgress).toBeDefined();
        expect(unit.completed).toBeDefined();
        expect(unit.onHold).toBeDefined();
        expect(unit.total).toBeDefined();
      });
    });
  });

  describe('Chart Data', () => {
    it('should initialize chartData object', () => {
      expect(component.chartData).toBeDefined();
    });

    it('should have monthly data with 4 weeks', () => {
      expect(component.chartData.monthly).toBeDefined();
      expect(component.chartData.monthly.length).toBe(4);
      expect(component.chartData.monthly[0].period).toBe('Week 1');
      expect(component.chartData.monthly[0].projects).toBe(15);
      expect(component.chartData.monthly[3].period).toBe('Week 4');
      expect(component.chartData.monthly[3].projects).toBe(25);
    });

    it('should have quarterly data with 4 quarters', () => {
      expect(component.chartData.quarterly).toBeDefined();
      expect(component.chartData.quarterly.length).toBe(4);
      expect(component.chartData.quarterly[0].period).toBe('Q1 2024');
      expect(component.chartData.quarterly[0].projects).toBe(45);
      expect(component.chartData.quarterly[3].period).toBe('Q4 2024');
      expect(component.chartData.quarterly[3].projects).toBe(78);
    });

    it('should have yearly data with 12 months', () => {
      expect(component.chartData.yearly).toBeDefined();
      expect(component.chartData.yearly.length).toBe(12);
      expect(component.chartData.yearly[0].period).toBe('Jan');
      expect(component.chartData.yearly[0].projects).toBe(12);
      expect(component.chartData.yearly[11].period).toBe('Dec');
      expect(component.chartData.yearly[11].projects).toBe(37);
    });

    it('should have last5Years data with 5 years', () => {
      expect(component.chartData.last5Years).toBeDefined();
      expect(component.chartData.last5Years.length).toBe(5);
      expect(component.chartData.last5Years[0].period).toBe('2020');
      expect(component.chartData.last5Years[0].projects).toBe(120);
      expect(component.chartData.last5Years[4].period).toBe('2024');
      expect(component.chartData.last5Years[4].projects).toBe(320);
    });

    it('should have allTime data with 7 years', () => {
      expect(component.chartData.allTime).toBeDefined();
      expect(component.chartData.allTime.length).toBe(7);
      expect(component.chartData.allTime[0].period).toBe('2018');
      expect(component.chartData.allTime[0].projects).toBe(80);
      expect(component.chartData.allTime[6].period).toBe('2024');
      expect(component.chartData.allTime[6].projects).toBe(320);
    });

    it('should have all chart data entries with period and projects properties', () => {
      const allDataSets = [
        component.chartData.monthly,
        component.chartData.quarterly,
        component.chartData.yearly,
        component.chartData.last5Years,
        component.chartData.allTime
      ];

      allDataSets.forEach(dataSet => {
        dataSet.forEach(entry => {
          expect(entry.period).toBeDefined();
          expect(entry.projects).toBeDefined();
          expect(typeof entry.period).toBe('string');
          expect(typeof entry.projects).toBe('number');
        });
      });
    });

    it('should have increasing trend in last5Years data', () => {
      for (let i = 1; i < component.chartData.last5Years.length; i++) {
        expect(component.chartData.last5Years[i].projects)
          .toBeGreaterThan(component.chartData.last5Years[i - 1].projects);
      }
    });
  });

  describe('Template Rendering', () => {
    it('should render header with title', () => {
      const header = compiled.querySelector('h1');
      expect(header).toBeTruthy();
      expect(header?.textContent).toContain('Welcome back');
    });

    it('should render header description', () => {
      const description = compiled.querySelector('p.text-gray-500');
      expect(description).toBeTruthy();
      expect(description?.textContent).toContain('Comprehensive overview');
    });

    it('should render redirect button', () => {
      const button = compiled.querySelector('button');
      expect(button).toBeTruthy();
      expect(button?.textContent).toContain('Redirect to User Side');
    });

    it('should render metric cards grid', () => {
      const grid = compiled.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4');
      expect(grid).toBeTruthy();
    });

    it('should render app-dashboard-metric-card components', () => {
      const metricCards = fixture.debugElement.queryAll(By.css('app-dashboard-metric-card'));
      expect(metricCards.length).toBe(4);
    });

it('should pass correct data to metric card components', () => {
  const metricCards = fixture.debugElement.queryAll(By.directive(DashboardMetricCards));

  metricCards.forEach((cardDe, index) => {
    const cardInstance = cardDe.componentInstance as DashboardMetricCards;
    expect(cardInstance.title).toBe(component.metricCards[index].title);
    expect(cardInstance.value).toBe(component.metricCards[index].value);
    expect(cardInstance.icon).toBe(component.metricCards[index].icon);
    expect(cardInstance.iconBgColor).toBe(component.metricCards[index].iconBgColor);
    expect(cardInstance.iconColor).toBe(component.metricCards[index].iconColor);
    expect(cardInstance.borderColor).toBe(component.metricCards[index].borderColor);
  });
});


    it('should render app-project-activity-timeline component', () => {
      const timeline = fixture.debugElement.query(By.css('app-project-activity-timeline'));
      expect(timeline).toBeTruthy();
    });

    it('should render app-project-status component', () => {
      const status = fixture.debugElement.query(By.css('app-project-status'));
      expect(status).toBeTruthy();
    });

    it('should have correct grid layout for charts section', () => {
      const chartsGrid = compiled.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3');
      expect(chartsGrid).toBeTruthy();
    });

    it('should render timeline in 2-column layout', () => {
      const timelineContainer = compiled.querySelector('.lg\\:col-span-2');
      expect(timelineContainer).toBeTruthy();
      const timeline = timelineContainer?.querySelector('app-project-activity-timeline');
      expect(timeline).toBeTruthy();
    });

    it('should render status in 1-column layout', () => {
      const statusContainer = compiled.querySelector('.lg\\:col-span-1');
      expect(statusContainer).toBeTruthy();
      const status = statusContainer?.querySelector('app-project-status');
      expect(status).toBeTruthy();
    });
  });

  describe('Data Integrity', () => {
    it('should have consistent total projects across all data sources', () => {
      const totalProjectsFromCard = component.metricCards[0].value;
      const totalProjectsFromStatus = component.projectStatusData.reduce(
        (sum, unit) => sum + unit.total, 0
      );
      expect(totalProjectsFromCard).toBe(totalProjectsFromStatus);
    });

    it('should have consistent in-progress count', () => {
      const inProgressFromCard = component.metricCards[1].value;
      const inProgressFromStatus = component.projectStatusData.reduce(
        (sum, unit) => sum + unit.inProgress, 0
      );
      expect(inProgressFromCard).toBe(inProgressFromStatus);
    });

    it('should have consistent on-hold count', () => {
      const onHoldFromCard = component.metricCards[2].value;
      const onHoldFromStatus = component.projectStatusData.reduce(
        (sum, unit) => sum + unit.onHold, 0
      );
      expect(onHoldFromCard).toBe(onHoldFromStatus);
    });

    it('should have correct number of delivery units', () => {
      const deliveryUnitsFromCard = component.metricCards[3].value;
      const deliveryUnitsCount = component.projectStatusData.length;
      expect(deliveryUnitsFromCard).toBe(deliveryUnitsCount);
    });

    it('should have all non-negative values in metric cards', () => {
      component.metricCards.forEach(card => {
        expect(card.value).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have all non-negative values in project status data', () => {
      component.projectStatusData.forEach(unit => {
        expect(unit.inProgress).toBeGreaterThanOrEqual(0);
        expect(unit.completed).toBeGreaterThanOrEqual(0);
        expect(unit.onHold).toBeGreaterThanOrEqual(0);
        expect(unit.total).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have all non-negative values in chart data', () => {
      const allDataSets = [
        component.chartData.monthly,
        component.chartData.quarterly,
        component.chartData.yearly,
        component.chartData.last5Years,
        component.chartData.allTime
      ];

      allDataSets.forEach(dataSet => {
        dataSet.forEach(entry => {
          expect(entry.projects).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty metric cards array', () => {
      component.metricCards = [];
      fixture.detectChanges();
      const metricCards = fixture.debugElement.queryAll(By.css('app-dashboard-metric-card'));
      expect(metricCards.length).toBe(0);
    });

    it('should handle metric card with undefined optional properties', () => {
      const cardWithoutOptionals = {
        title: 'Test Card',
        value: 10,
        icon: '/test.svg',
        iconBgColor: 'bg-gray-50',
        iconColor: 'text-gray-600',
        borderColor: 'border-gray-100'
      };
      component.metricCards = [cardWithoutOptionals];
      fixture.detectChanges();
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle empty projectStatusData array', () => {
      component.projectStatusData = [];
      fixture.detectChanges();
      expect(component.projectStatusData.length).toBe(0);
    });

    it('should maintain data immutability', () => {
      const originalMetricCards = [...component.metricCards];
      const originalStatusData = [...component.projectStatusData];
      
      // Simulate some operations
      fixture.detectChanges();
      
      expect(component.metricCards).toEqual(originalMetricCards);
      expect(component.projectStatusData).toEqual(originalStatusData);
    });
  });
});