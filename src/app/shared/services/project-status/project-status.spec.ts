import { TestBed } from '@angular/core/testing';
import { ProjectStatusService, ProjectStatus } from './project-status.service';

describe('ProjectStatusService', () => {
  let service: ProjectStatusService;

  const expectedStatuses: ProjectStatus[] = [
    { id: 1, code: 'Active', name: 'Active', description: 'Project is currently in progress' },
    { id: 2, code: 'Inactive', name: 'Inactive', description: 'Project is temporarily paused' },
    { id: 3, code: 'Completed', name: 'Completed', description: 'Project has been finished' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectStatusService]
    });
    service = TestBed.inject(ProjectStatusService);
  });

  it('should create service as singleton instance', () => {
    expect(service).toBeTruthy();
    const service1 = TestBed.inject(ProjectStatusService);
    const service2 = TestBed.inject(ProjectStatusService);
    expect(service1).toBe(service2);
  });

  it('should return all statuses with correct structure and data', () => {
    const statuses = service.getStatuses();
    expect(statuses).toEqual(expectedStatuses);
    expect(statuses.length).toBe(3);
    
    statuses.forEach(status => {
      expect(status.id).toBeDefined();
      expect(status.code).toBeDefined();
      expect(status.name).toBeDefined();
      expect(status.description).toBeDefined();
      expect(typeof status.id).toBe('number');
      expect(typeof status.code).toBe('string');
    });
  });

  it('should lookup status by code for valid and invalid cases', () => {
    // Valid codes
    expect(service.getStatusByCode('Active')?.id).toBe(1);
    expect(service.getStatusByCode('Inactive')?.id).toBe(2);
    expect(service.getStatusByCode('Completed')?.id).toBe(3);
    
    // Invalid cases - case-sensitive
    expect(service.getStatusByCode('NonExistent')).toBeUndefined();
    expect(service.getStatusByCode('')).toBeUndefined();
    expect(service.getStatusByCode('ACTIVE')).toBeUndefined();
  });

  it('should lookup status by ID for valid and invalid cases', () => {
    // Valid IDs
    expect(service.getStatusById(1)?.code).toBe('Active');
    expect(service.getStatusById(2)?.code).toBe('Inactive');
    expect(service.getStatusById(3)?.code).toBe('Completed');
    
    // Invalid cases
    expect(service.getStatusById(999)).toBeUndefined();
    expect(service.getStatusById(-1)).toBeUndefined();
    expect(service.getStatusById(0)).toBeUndefined();
  });

  it('should return status codes and IDs with correct order', () => {
    const codes = service.getStatusCodes();
    expect(codes).toEqual(['Active', 'Inactive', 'Completed']);
    
    const ids = service.getStatusIds();
    expect(ids).toEqual([1, 2, 3]);
    
    ids.forEach(id => expect(typeof id).toBe('number'));
  });

  it('should maintain data integrity with unique IDs and codes', () => {
    const statuses = service.getStatuses();
    
    // Check uniqueness
    const ids = statuses.map(s => s.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
    
    const codes = statuses.map(s => s.code);
    const uniqueCodes = new Set(codes);
    expect(codes.length).toBe(uniqueCodes.size);
    
    // Check all have descriptions
    statuses.forEach(status => {
      expect(status.description?.trim().length).toBeGreaterThan(0);
    });
  });

  it('should ensure bidirectional lookup consistency', () => {
    const statuses = service.getStatuses();
    
    statuses.forEach(status => {
      const byId = service.getStatusById(status.id);
      const byCode = service.getStatusByCode(status.code);
      
      expect(byId).toEqual(status);
      expect(byCode).toEqual(status);
      expect(byId?.id).toBe(byCode?.id);
      expect(byId?.code).toBe(byCode?.code);
    });
  });

  it('should handle edge cases and special inputs gracefully', () => {
    // Null and undefined inputs
    expect(() => service.getStatusByCode(null as any)).not.toThrow();
    expect(service.getStatusById(undefined as any)).toBeUndefined();
    
    // Special characters and very long strings
    expect(service.getStatusByCode('@#$%^&*()')).toBeUndefined();
    expect(service.getStatusByCode('A'.repeat(10000))).toBeUndefined();
    
    // Float and negative numbers
    expect(service.getStatusById(1.5)).toBeUndefined();
    expect(service.getStatusById(-999999)).toBeUndefined();
  });

  it('should support array operations on returned data', () => {
    // Filter codes by pattern
    const codes = service.getStatusCodes();
    const filteredCodes = codes.filter(code => code.includes('I'));
    expect(filteredCodes).toContain('Inactive');
    
    // Map IDs to codes
    const ids = service.getStatusIds();
    const codeMappings = ids.map(id => service.getStatusById(id)?.code);
    expect(codeMappings).toContain('Active');
    expect(codeMappings).toContain('Inactive');
    expect(codeMappings).toContain('Completed');
    
    // Filter statuses by condition
    const statuses = service.getStatuses();
    const activeStatuses = statuses.filter(s => s.id <= 2);
    expect(activeStatuses.length).toBe(2);
  });

  it('should perform lookups efficiently under load', () => {
    // Test code lookup performance
    let startTime = performance.now();
    for (let i = 0; i < 1000; i++) {
      service.getStatusByCode('Active');
    }
    let endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(100);
    
    // Test ID lookup performance
    startTime = performance.now();
    for (let i = 0; i < 1000; i++) {
      service.getStatusById(1);
    }
    endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(100);
  });

  it('should maintain ID-Code relationship consistency across all statuses', () => {
    const statuses = service.getStatuses();
    
    // Verify expected relationships
    expect(statuses[0].id).toBe(1);
    expect(statuses[0].code).toBe('Active');
    expect(statuses[1].id).toBe(2);
    expect(statuses[1].code).toBe('Inactive');
    expect(statuses[2].id).toBe(3);
    expect(statuses[2].code).toBe('Completed');
    
    // Cross-verify with getters
    statuses.forEach(status => {
      expect(service.getStatusById(status.id)?.code).toBe(status.code);
      expect(service.getStatusByCode(status.code)?.id).toBe(status.id);
    });
  });

  it('should handle special numeric and string edge cases in lookups', () => {
    // Boundary values
    expect(service.getStatusById(0)).toBeUndefined();
    expect(service.getStatusById(1)).toBeDefined();
    expect(service.getStatusById(4)).toBeUndefined();
    
    // String edge cases
    expect(service.getStatusByCode('Active')).toBeDefined();
    expect(service.getStatusByCode(' Active')).toBeUndefined();
    expect(service.getStatusByCode('Active ')).toBeUndefined();
    expect(service.getStatusByCode('')).toBeUndefined();
  });
});
