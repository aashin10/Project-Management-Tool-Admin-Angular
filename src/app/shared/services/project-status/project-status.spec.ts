import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProjectStatusService, ProjectStatus } from './project-status.service';

describe('ProjectStatusService', () => {
  let service: ProjectStatusService;
  let httpMock: HttpTestingController;

  const mockApiResponse = {
    status: 200,
    data: [
      { id: 1, name: 'Active', description: 'Project is currently in progress' },
      { id: 2, name: 'Inactive', description: 'Project is temporarily paused' },
      { id: 3, name: 'Completed', description: 'Project has been finished' }
    ],
    message: 'Success'
  };

  const expectedStatuses: ProjectStatus[] = [
    { id: 1, code: 'Active', name: 'Active', description: 'Project is currently in progress' },
    { id: 2, code: 'Inactive', name: 'Inactive', description: 'Project is temporarily paused' },
    { id: 3, code: 'Completed', name: 'Completed', description: 'Project has been finished' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectStatusService]
    });
    service = TestBed.inject(ProjectStatusService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create service as singleton instance', () => {
    expect(service).toBeTruthy();
  });

  it('should return all statuses with correct structure and data', fakeAsync(() => {
    service.getStatuses().subscribe(statuses => {
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

    const req = httpMock.expectOne('api/status/project-statuses');
    expect(req.request.method).toBe('GET');
    req.flush(mockApiResponse);
    tick();
  }));

  it('should lookup status by code for valid and invalid cases', fakeAsync(() => {
    // Valid codes
    service.getStatusByCode('Active').subscribe(status => {
      expect(status?.id).toBe(1);
    });
    
    service.getStatusByCode('Inactive').subscribe(status => {
      expect(status?.id).toBe(2);
    });
    
    service.getStatusByCode('Completed').subscribe(status => {
      expect(status?.id).toBe(3);
    });
    
    // Invalid cases
    service.getStatusByCode('NonExistent').subscribe(status => {
      expect(status).toBeUndefined();
    });

    const req = httpMock.expectOne('api/status/project-statuses');
    req.flush(mockApiResponse);
    tick();
  }));

  it('should lookup status by id for valid and invalid cases', fakeAsync(() => {
    service.getStatusById(1).subscribe(status => {
      expect(status?.code).toBe('Active');
    });
    
    service.getStatusById(2).subscribe(status => {
      expect(status?.code).toBe('Inactive');
    });
    
    service.getStatusById(3).subscribe(status => {
      expect(status?.code).toBe('Completed');
    });
    
    // Invalid id
    service.getStatusById(999).subscribe(status => {
      expect(status).toBeUndefined();
    });

    const req = httpMock.expectOne('api/status/project-statuses');
    req.flush(mockApiResponse);
    tick();
  }));

  it('should return status codes array', fakeAsync(() => {
    service.getStatusCodes().subscribe(codes => {
      expect(codes).toEqual(['Active', 'Inactive', 'Completed']);
    });

    const req = httpMock.expectOne('api/status/project-statuses');
    req.flush(mockApiResponse);
    tick();
  }));

  it('should return status ids array', fakeAsync(() => {
    service.getStatusIds().subscribe(ids => {
      expect(ids).toEqual([1, 2, 3]);
    });

    const req = httpMock.expectOne('api/status/project-statuses');
    req.flush(mockApiResponse);
    tick();
  }));

  it('should handle empty response', fakeAsync(() => {
    const emptyResponse = { status: 200, data: [], message: 'No data' };
    
    service.getStatuses().subscribe(statuses => {
      expect(statuses).toEqual([]);
    });

    const req = httpMock.expectOne('api/status/project-statuses');
    req.flush(emptyResponse);
    tick();
  }));

  it('should handle error response', fakeAsync(() => {
    service.getStatuses().subscribe(
      () => fail('Should have failed'),
      error => expect(error).toBeTruthy()
    );

    const req = httpMock.expectOne('api/status/project-statuses');
    req.error(new ErrorEvent('network error'));
    tick();
  }));
});
