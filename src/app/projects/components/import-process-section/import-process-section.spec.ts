import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportProcessSection } from './import-process-section';

describe('ImportProcessSection', () => {
  let component: ImportProcessSection;
  let fixture: ComponentFixture<ImportProcessSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportProcessSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportProcessSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
