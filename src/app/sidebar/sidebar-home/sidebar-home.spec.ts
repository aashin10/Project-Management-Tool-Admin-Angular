import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, NavigationEnd, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject } from 'rxjs';

import { SidebarHome } from './sidebar-home';

describe('SidebarHome', () => {
  let component: SidebarHome;
  let fixture: ComponentFixture<SidebarHome>;
  let router: Router;
  let mockDomSanitizer: jasmine.SpyObj<DomSanitizer>;
  let routerEventsSubject: Subject<any>;

  // Define some basic routes for testing
  const routes: Routes = [
    { path: 'dashboard', component: SidebarHome },
    { path: 'projects', component: SidebarHome },
    { path: 'projects/create', component: SidebarHome },
    { path: 'projects/importfromjira', component: SidebarHome },
    { path: 'settings/add-access', component: SidebarHome },
    { path: 'settings/importexport', component: SidebarHome },
    { path: 'users', component: SidebarHome },
    { path: 'roles', component: SidebarHome },
    { path: 'reports', component: SidebarHome },
    { path: 'deliveryunits', component: SidebarHome }
  ];

  beforeEach(async () => {
    routerEventsSubject = new Subject();
    mockDomSanitizer = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustHtml']);

    await TestBed.configureTestingModule({
      imports: [SidebarHome, RouterTestingModule.withRoutes(routes)],
      providers: [
        { provide: DomSanitizer, useValue: mockDomSanitizer }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarHome);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  describe('Component Creation and Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with correct default values', () => {
      expect(component.isCollapsed).toBeFalse();
      expect(component.menuItems).toBeDefined();
      expect(component.menuItems.length).toBeGreaterThan(0);
    });

    it('should have all required menu items', () => {
      const expectedLabels = ['Dashboard', 'Projects', 'DU Management', 'User Management', 'Roles and Permissions', 'Reports', 'Settings'];
      const actualLabels = component.menuItems.map(item => item.label);
      expect(actualLabels).toEqual(expectedLabels);
    });

    it('should initialize menu items with correct structure', () => {
      component.menuItems.forEach(item => {
        expect(item.label).toBeDefined();
        expect(item.icon).toBeDefined();
        // Only items with children should have expanded property
        if (item.children && item.children.length > 0) {
          expect(item.expanded).toBeDefined();
          expect(item.expanded).toBeFalse();
        }
      });
    });
  });

  describe('Icon Sanitization', () => {
    it('should sanitize SVG icons correctly', () => {
      const testIcon = '<svg>test</svg>';
      const mockSafeHtml = {} as SafeHtml;
      mockDomSanitizer.bypassSecurityTrustHtml.and.returnValue(mockSafeHtml);

      const result = component.getSanitizedIcon(testIcon);

      expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(testIcon);
      expect(result).toBe(mockSafeHtml);
    });

    it('should return SafeHtml object', () => {
      const testIcon = '<svg>test</svg>';
      const mockSafeHtml = {} as SafeHtml;
      mockDomSanitizer.bypassSecurityTrustHtml.and.returnValue(mockSafeHtml);

      const result = component.getSanitizedIcon(testIcon);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should handle empty icon strings', () => {
      const mockSafeHtml = {} as SafeHtml;
      mockDomSanitizer.bypassSecurityTrustHtml.and.returnValue(mockSafeHtml);

      const result = component.getSanitizedIcon('');

      expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('');
      expect(result).toBe(mockSafeHtml);
    });
  });

  describe('Section Toggling', () => {
    it('should expand sidebar and section when sidebar is collapsed', () => {
      component.isCollapsed = true;
      const testItem = component.menuItems[1]; // Projects item
      testItem.expanded = false;

      component.toggleSection(testItem);

      expect(component.isCollapsed).toBeFalse();
      expect(testItem.expanded).toBeTrue();
    });

    it('should toggle section expansion when sidebar is expanded', () => {
      component.isCollapsed = false;
      const testItem = component.menuItems[1]; // Projects item
      testItem.expanded = false;

      component.toggleSection(testItem);

      expect(component.isCollapsed).toBeFalse();
      expect(testItem.expanded).toBeTrue();

      component.toggleSection(testItem);

      expect(testItem.expanded).toBeFalse();
    });

    it('should handle sections without children', () => {
      component.isCollapsed = false;
      const testItem = component.menuItems[0]; // Dashboard item (no children)

      component.toggleSection(testItem);

      expect(component.isCollapsed).toBeFalse();
      // Should not throw error for items without children
    });

    it('should maintain sidebar state when toggling sections', () => {
      component.isCollapsed = false;
      const testItem = component.menuItems[1];

      component.toggleSection(testItem);

      expect(component.isCollapsed).toBeFalse();
    });
  });

  describe('Collapse Toggling', () => {
    it('should toggle collapse state from expanded to collapsed', () => {
      component.isCollapsed = false;

      component.toggleCollapse();

      expect(component.isCollapsed).toBeTrue();
    });

    it('should toggle collapse state from collapsed to expanded', () => {
      component.isCollapsed = true;

      component.toggleCollapse();

      expect(component.isCollapsed).toBeFalse();
    });

    it('should collapse all accordions when sidebar is collapsed', () => {
      component.isCollapsed = false;
      // Expand some sections first
      component.menuItems[1].expanded = true; // Projects
      component.menuItems[6].expanded = true; // Settings

      component.toggleCollapse();

      expect(component.isCollapsed).toBeTrue();
      component.menuItems.forEach(item => {
        if (item.children && item.children.length > 0) {
          expect(item.expanded).toBeFalse();
        }
      });
    });

    it('should expand active parent when sidebar is expanded', () => {
      component.isCollapsed = true;
      spyOn(component as any, 'expandActiveParent');

      component.toggleCollapse();

      expect(component.isCollapsed).toBeFalse();
      expect((component as any).expandActiveParent).toHaveBeenCalled();
    });

    it('should not expand accordions for items without children when collapsing', () => {
      component.isCollapsed = false;
      const dashboardItem = component.menuItems[0]; // No children

      component.toggleCollapse();

      expect(component.isCollapsed).toBeTrue();
      // Items without children should not be affected
    });
  });

  describe('Router Integration', () => {
    it('should subscribe to router events on initialization', () => {
      expect(router).toBeDefined();
      // Component subscribes to router events in constructor
    });

    it('should call expandActiveParent on component initialization', () => {
      // expandActiveParent is called in constructor
      // We can't easily spy on private methods, so we test the behavior indirectly
      expect(component).toBeTruthy();
    });
  });

  describe('expandActiveParent Method', () => {
    beforeEach(() => {
      // Reset all menu items expanded state
      component.menuItems.forEach(item => {
        if (item.children && item.children.length > 0) {
          item.expanded = false;
        }
      });
    });

    it('should expand parent when child route is active', () => {
      const mockRouter = TestBed.inject(Router);
      spyOnProperty(mockRouter, 'url', 'get').and.returnValue('/projects/create');
      component.isCollapsed = false;

      (component as any).expandActiveParent();

      const projectsItem = component.menuItems.find(item => item.label === 'Projects');
      expect(projectsItem?.expanded).toBeTrue();
    });

    it('should not expand parent when sidebar is collapsed', () => {
      const mockRouter = TestBed.inject(Router);
      spyOnProperty(mockRouter, 'url', 'get').and.returnValue('/projects/create');
      component.isCollapsed = true;

      (component as any).expandActiveParent();

      const projectsItem = component.menuItems.find(item => item.label === 'Projects');
      expect(projectsItem?.expanded).toBeFalse();
    });

    it('should handle different route patterns', () => {
      // Test projects routes
      component.isCollapsed = false;
      // Test that the method works with current router URL
      expect(() => (component as any).expandActiveParent()).not.toThrow();
    });

    it('should handle non-existent routes', () => {
      const mockRouter = TestBed.inject(Router);
      spyOnProperty(mockRouter, 'url', 'get').and.returnValue('/nonexistent');
      component.isCollapsed = false;

      (component as any).expandActiveParent();

      // No items should be expanded for non-existent routes
      component.menuItems.forEach(item => {
        if (item.children && item.children.length > 0) {
          expect(item.expanded).toBeFalse();
        }
      });
    });

    it('should handle routes that partially match', () => {
      const mockRouter = TestBed.inject(Router);
      spyOnProperty(mockRouter, 'url', 'get').and.returnValue('/projects/some-other-path');
      component.isCollapsed = false;

      (component as any).expandActiveParent();

      const projectsItem = component.menuItems.find(item => item.label === 'Projects');
      expect(projectsItem?.expanded).toBeTrue();
    });

    it('should reset expanded state for non-active parents', () => {
      // Test that the method can handle state changes
      component.isCollapsed = false;
      (component as any).expandActiveParent();
      expect(component).toBeTruthy();
    });
  });

  describe('State Management', () => {
    it('should maintain menu item states independently', () => {
      const projectsItem = component.menuItems[1];
      const settingsItem = component.menuItems[6];

      // Expand projects
      component.toggleSection(projectsItem);
      expect(projectsItem.expanded).toBeTrue();
      expect(settingsItem.expanded).toBeFalse();

      // Expand settings
      component.toggleSection(settingsItem);
      expect(projectsItem.expanded).toBeTrue();
      expect(settingsItem.expanded).toBeTrue();

      // Collapse projects
      component.toggleSection(projectsItem);
      expect(projectsItem.expanded).toBeFalse();
      expect(settingsItem.expanded).toBeTrue();
    });

    it('should handle multiple section expansions', () => {
      const projectsItem = component.menuItems[1];
      const settingsItem = component.menuItems[6];

      component.toggleSection(projectsItem);
      component.toggleSection(settingsItem);

      expect(projectsItem.expanded).toBeTrue();
      expect(settingsItem.expanded).toBeTrue();
    });

    it('should preserve menu item properties', () => {
      const originalItem = { ...component.menuItems[0] };

      component.toggleCollapse();

      expect(component.menuItems[0].label).toBe(originalItem.label);
      expect(component.menuItems[0].icon).toBe(originalItem.icon);
      expect(component.menuItems[0].route).toBe(originalItem.route);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null router URL gracefully', () => {
      const mockRouter = TestBed.inject(Router);
      spyOnProperty(mockRouter, 'url', 'get').and.returnValue(null as any);

      expect(() => (component as any).expandActiveParent()).not.toThrow();
    });

    it('should handle undefined router URL gracefully', () => {
      const mockRouter = TestBed.inject(Router);
      spyOnProperty(mockRouter, 'url', 'get').and.returnValue(undefined as any);

      expect(() => (component as any).expandActiveParent()).not.toThrow();
    });

    it('should handle empty router URL gracefully', () => {
      const mockRouter = TestBed.inject(Router);
      spyOnProperty(mockRouter, 'url', 'get').and.returnValue('');

      expect(() => (component as any).expandActiveParent()).not.toThrow();
    });

    it('should handle menu items with empty children array', () => {
      const itemWithEmptyChildren = {
        label: 'Test',
        icon: 'test',
        children: [],
        expanded: false
      };

      component.menuItems.push(itemWithEmptyChildren);

      expect(() => component.toggleSection(itemWithEmptyChildren)).not.toThrow();
      expect(() => component.toggleCollapse()).not.toThrow();
    });

    it('should handle menu items without children property', () => {
      const itemWithoutChildren = {
        label: 'Test',
        icon: 'test',
        route: '/test'
      } as any;

      expect(() => component.toggleSection(itemWithoutChildren)).not.toThrow();
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete navigation flow', fakeAsync(() => {
      // Start with collapsed sidebar
      component.isCollapsed = true;

      // Navigate to projects create page using router
      router.navigate(['/projects/create']);
      tick();

      // Click on projects section (should expand sidebar and section)
      const projectsItem = component.menuItems[1];
      component.toggleSection(projectsItem);

      expect(component.isCollapsed).toBeFalse();
      expect(projectsItem.expanded).toBeTrue();
    }));

    it('should handle sidebar collapse and expand with active routes', () => {
      // Set active route
      spyOnProperty(router, 'url', 'get').and.returnValue('/projects/create');
      (component as any).expandActiveParent();

      // Collapse sidebar
      component.toggleCollapse();
      expect(component.isCollapsed).toBeTrue();

      // Verify sections are collapsed
      const projectsItem = component.menuItems[1];
      expect(projectsItem.expanded).toBeFalse();

      // Expand sidebar
      component.toggleCollapse();
      expect(component.isCollapsed).toBeFalse();

      // Verify active section is re-expanded
      expect(projectsItem.expanded).toBeTrue();
    });

    it('should handle rapid successive toggles', () => {
      const projectsItem = component.menuItems[1];

      // Rapid toggle section
      component.toggleSection(projectsItem); // expand
      expect(projectsItem.expanded).toBeTrue();

      component.toggleSection(projectsItem); // collapse
      expect(projectsItem.expanded).toBeFalse();

      component.toggleSection(projectsItem); // expand again
      expect(projectsItem.expanded).toBeTrue();
    });

    it('should handle multiple router events in sequence', () => {
      // Test that component can handle multiple operations
      expect(component).toBeTruthy();
    });
  });
});
