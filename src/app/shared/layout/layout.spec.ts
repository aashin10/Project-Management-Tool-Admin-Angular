import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Layout } from './layout';
import { RouterTestingModule } from '@angular/router/testing';

describe('Layout', () => {
  let component: Layout;
  let fixture: ComponentFixture<Layout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Layout, RouterTestingModule],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(Layout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
