import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedFilterSection } from './advanced-filter-section';

describe('AdvancedFilterSection', () => {
  let component: AdvancedFilterSection;
  let fixture: ComponentFixture<AdvancedFilterSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedFilterSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedFilterSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
