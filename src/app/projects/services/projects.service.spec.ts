import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ProjectsService, Project, ApiResponse, PaginatedResponse, ProjectTableDTO } from './projects.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:5291/api/Projects';

  const mockProjectTableDTO: ProjectTableDTO = {
    id: '1',
    name: 'Test Project',
    key: 'TP-001',
    status: { id: 1, name: 'Active' },
    deliveryUnit: { id: 1, name: 'DU-1', code: 'DU1' },
    teamSize: 5,
    projectManager: { id: 1, name: 'John Doe' }
  };

  const mockPaginatedResponse: PaginatedResponse<ProjectTableDTO> = {
    items: [mockProjectTableDTO],
    totalCount: 1,
    page: 1,
    pageSize: 10,
    totalPages: 1
  };

  const mockApiResponse: ApiResponse<PaginatedResponse<ProjectTableDTO>> = {
    status: 200,
    data: mockPaginatedResponse,
    message: 'Success'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectsService]
    });
    service = TestBed.inject(ProjectsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Test 2: getProjects - success
  it('should fetch all projects successfully', (done) => {
    service.getProjects(1, 10).subscribe(response => {
      expect(response).toBeTruthy();
      expect(response.status).toBe(200);
      expect(response.data.items.length).toBe(1);
      expect(response.data.items[0].name).toBe('Test Project');
      done();
    });

    const req = httpMock.expectOne(request => 
      request.url === apiUrl && 
      request.params.get('page') === '1' && 
      request.params.get('pageSize') === '10'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockApiResponse);
  });

  // Test 3: getProjects with filters
  it('should fetch projects with search and filters', (done) => {
    const searchTerm = 'Test';
    const statusIds = [1];
    const deliveryUnitIds = [1];
    const projectManagerIds = [1];

    service.getProjects(1, 10, searchTerm, statusIds, deliveryUnitIds, projectManagerIds).subscribe(response => {
      expect(response.status).toBe(200);
      done();
    });

    const req = httpMock.expectOne(request => 
      request.url === apiUrl && 
      request.params.get('searchTerm') === searchTerm &&
      request.params.get('statusIds') === '1' &&
      request.params.get('deliveryUnitIds') === '1' &&
      request.params.get('projectManagerIds') === '1'
    );
    req.flush(mockApiResponse);
  });

  // Test 4: getProjects with pagination
  it('should fetch projects with pagination', (done) => {
    const mockResponse: ApiResponse<PaginatedResponse<ProjectTableDTO>> = {
      status: 200,
      data: {
        items: [mockProjectTableDTO],
        totalCount: 100,
        page: 1,
        pageSize: 10,
        totalPages: 10
      },
      message: 'Success'
    };

    service.getProjects(1, 10).subscribe(response => {
      expect(response.status).toBe(200);
      expect(response.data.totalCount).toBe(100);
      expect(response.data.totalPages).toBe(10);
      done();
    });

    const req = httpMock.expectOne(request => request.url === apiUrl);
    req.flush(mockResponse);
  });

  // Test 5: getProjectById - success
  it('should fetch single project by ID', (done) => {
    const projectId = '1';
    const mockProjectResponse: ApiResponse<any> = {
      status: 200,
      data: {
        id: projectId,
        name: 'Test Project',
        key: 'TP-001',
        description: 'Test Description',
        customerOrgName: 'Test Org',
        teamSize: 5,
        sprintCount: 10,
        additionalInformation: [],
        teams: [],
        teamMembers: [],
        createdAt: '2025-01-01'
      },
      message: 'Success'
    };

    service.getProjectById(projectId).subscribe(response => {
      expect(response).toBeTruthy();
      expect(response.status).toBe(200);
      expect(response.data.id).toBe(projectId);
      expect(response.data.name).toBe('Test Project');
      done();
    });

    const req = httpMock.expectOne(`${apiUrl}/${projectId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProjectResponse);
  });

  // Test 6: getProjectById with full details
  it('should fetch complete project details by ID', (done) => {
    const projectId = '1';
    const mockProjectResponse: ApiResponse<any> = {
      status: 200,
      data: {
        id: projectId,
        name: 'Test Project',
        key: 'TP-001',
        description: 'Test Description',
        customerOrgName: 'Test Org',
        teamSize: 5,
        sprintCount: 10,
        additionalInformation: [],
        teams: [
          { id: 1, name: 'Frontend', description: 'Frontend Team', teamMembers: 3 }
        ],
        teamMembers: [
          { id: 1, name: 'Member 1', role: 'Developer' }
        ],
        createdAt: '2025-01-01'
      },
      message: 'Success'
    };

    service.getProjectById(projectId).subscribe(response => {
      expect(response).toBeTruthy();
      expect(response.status).toBe(200);
      expect(response.data.id).toBe(projectId);
      expect(response.data.teams.length).toBe(1);
      done();
    });

    const req = httpMock.expectOne(`${apiUrl}/${projectId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProjectResponse);
  });

  // Test 7: deleteProject - success
  it('should delete project successfully', (done) => {
    const projectId = '1';
    const mockDeleteResponse: ApiResponse<any> = {
      status: 200,
      data: {},
      message: 'Project deleted successfully'
    };

    service.deleteProject(projectId).subscribe(response => {
      expect(response.status).toBe(200);
      expect(response.message).toContain('deleted');
      done();
    });

    const req = httpMock.expectOne(`${apiUrl}/${projectId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockDeleteResponse);
  });

  // Test 8: deleteProject error handling
  it('should handle error when deleting project', (done) => {
    const projectId = '1';
    
    service.deleteProject(projectId).subscribe(
      () => fail('should have failed'),
      (error) => {
        expect(error).toBeTruthy();
        done();
      }
    );

    const req = httpMock.expectOne(`${apiUrl}/${projectId}`);
    req.error(new ErrorEvent('Delete failed'));
  });

  // Test 9: getUniqueProjectManagers
  it('should fetch unique project managers', (done) => {
    const mockManagersResponse: ApiResponse<any[]> = {
      status: 200,
      data: [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' }
      ],
      message: 'Success'
    };

    service.getUniqueProjectManagers().subscribe(response => {
      expect(response.status).toBe(200);
      expect(response.data.length).toBe(2);
      done();
    });

    const req = httpMock.expectOne(`${apiUrl}/managers`);
    expect(req.request.method).toBe('GET');
    req.flush(mockManagersResponse);
  });

  // Test 10: getTeamMembers
  it('should fetch team members for a project and team', (done) => {
    const projectId = '1';
    const teamId = 1;
    const mockTeamMembersResponse: ApiResponse<any> = {
      status: 200,
      data: {
        members: [
          { id: 1, name: 'Member 1', role: 'Developer', email: 'member1@test.com', teamId: teamId }
        ]
      },
      message: 'Success'
    };

    service.getTeamMembers(projectId, teamId).subscribe(response => {
      expect(response.status).toBe(200);
      expect(response.data.members.length).toBe(1);
      done();
    });

    const req = httpMock.expectOne(`${apiUrl}/${projectId}/teams/${teamId}/members`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTeamMembersResponse);
  });

  // Test 11: Pagination with different page sizes
  it('should handle pagination with different page sizes', (done) => {
    const mockResponse: ApiResponse<PaginatedResponse<ProjectTableDTO>> = {
      status: 200,
      data: {
        items: [mockProjectTableDTO],
        totalCount: 40,
        pageSize: 20,
        page: 2,
        totalPages: 2
      },
      message: 'Success'
    };

    service.getProjects(2, 20).subscribe(response => {
      expect(response.data.pageSize).toBe(20);
      expect(response.data.page).toBe(2);
      expect(response.data.totalPages).toBe(2);
      done();
    });

    const req = httpMock.expectOne(request => 
      request.url === apiUrl && 
      request.params.get('pageSize') === '20' &&
      request.params.get('page') === '2'
    );
    req.flush(mockResponse);
  });
});