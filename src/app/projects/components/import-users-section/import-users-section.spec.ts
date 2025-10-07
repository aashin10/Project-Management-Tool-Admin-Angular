import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportUsersSection } from './import-users-section';

describe('ImportUsersSection', () => {
  let component: ImportUsersSection;
  let fixture: ComponentFixture<ImportUsersSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportUsersSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportUsersSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
