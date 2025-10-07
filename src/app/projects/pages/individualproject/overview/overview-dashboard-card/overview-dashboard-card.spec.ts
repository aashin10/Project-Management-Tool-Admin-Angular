import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverviewDashboardCard } from './overview-dashboard-card';

describe('OverviewDashboardCard', () => {
  let component: OverviewDashboardCard;
  let fixture: ComponentFixture<OverviewDashboardCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewDashboardCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverviewDashboardCard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should properly set string input properties', () => {
    const testData = {
      title: 'Test Title',
      value: 'Test Value',
      subtitle: 'Test Subtitle',
      icon: '<svg>test-icon</svg>'
    };

    component.title = testData.title;
    component.value = testData.value;
    component.subtitle = testData.subtitle;
    component.icon = testData.icon;
    fixture.detectChanges();

    expect(component.title).toBe(testData.title);
    expect(component.value).toBe(testData.value);
    expect(component.subtitle).toBe(testData.subtitle);
    expect(component.icon).toBe(testData.icon);
  });

  it('should properly set numeric value input', () => {
    const numericValue = 42;
    component.value = numericValue;
    fixture.detectChanges();

    expect(component.value).toBe(numericValue);
  });

  it('should handle empty input values', () => {
    fixture.detectChanges();

    expect(component.title).toBeUndefined();
    expect(component.value).toBeUndefined();
    expect(component.subtitle).toBeUndefined();
    expect(component.icon).toBeUndefined();
  });

  it('should update when input properties change', () => {
    // Initial values
    component.title = 'Initial Title';
    component.value = 'Initial Value';
    fixture.detectChanges();

    // Updated values
    component.title = 'Updated Title';
    component.value = 'Updated Value';
    fixture.detectChanges();

    expect(component.title).toBe('Updated Title');
    expect(component.value).toBe('Updated Value');
  });

  it('should accept complex icon SVG string', () => {
    const complexIcon = `
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
    `;
    
    component.icon = complexIcon;
    fixture.detectChanges();

    expect(component.icon).toBe(complexIcon);
  });
});




