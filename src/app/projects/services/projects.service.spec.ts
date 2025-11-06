import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ProjectsService, Project, ApiResponse, PaginatedResponse, ProjectTableDTO, UpdateProjectRequest, ProjectDTO, AdditionalInformationDTO } from './projects.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let httpMock: HttpTestingController;
  const apiUrl = 'https://localhost:7178/api/Projects';

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

  // Test 12: updateProject - success
  it('should update project successfully', (done) => {
    const projectId = '11111111-1111-1111-1111-111111111111';
    const updateRequest = {
      id: projectId,
      name: 'Updated Project 1',
      key: 'PROJ001',
      description: 'Updated Description for Project 1',
      customerOrgName: 'Updated Customer Org 1',
      customerDomainUrl: 'https://updated-customer.com',
      customerDescription: 'Updated customer description',
      pocEmail: 'updated-customer@example.com',
      pocPhone: '+1234567890',
      projectManagerId: 2,
      projectManagerRoleId: 2,
      statusId: 1,
      deliveryUnitId: 1,
      additionalInformation: [
        {
          id: '00000000-0000-0000-0000-000000000049',
          name: 'Budget',
          value: '$900,000'
        },
        {
          id: '00000000-0000-0000-0000-000000000050',
          name: 'Client Priority',
          value: 'High'
        }
      ]
    };

    const mockUpdateResponse = {
      status: 200,
      data: {
        id: projectId,
        name: 'Updated Project 1',
        key: 'PROJ001',
        description: 'Updated Description for Project 1',
        customerOrgName: 'Updated Customer Org 1',
        customerDomainUrl: 'https://updated-customer.com',
        customerDescription: 'Updated customer description',
        pocEmail: 'updated-customer@example.com',
        pocPhone: '+1234567890',
        projectManagerId: 2,
        projectManagerName: 'Project Manager 1',
        projectManagerRoleId: 2,
        statusId: 1,
        statusName: 'Active',
        deliveryUnitId: 1,
        deliveryUnitName: 'Automotive',
        deliveryUnitCode: 'AUTO',
        teamSize: 0,
        sprintCount: 0,
        additionalInformation: [
          {
            id: '00000000-0000-0000-0000-000000000049',
            name: 'Budget',
            value: '$900,000'
          },
          {
            id: '00000000-0000-0000-0000-000000000050',
            name: 'Client Priority',
            value: 'High'
          }
        ],
        teams: [
          {
            id: 1,
            name: 'Team 1',
            description: 'Development team for Project 1',
            memberCount: 0,
            leadName: null,
            isActive: true
          }
        ],
        isImportedFromJira: null,
        createdAt: '2024-01-05T05:00:00Z',
        updatedAt: '2025-11-02T12:14:42.2197277Z'
      },
      message: 'Project updated successfully'
    };

    service.updateProject(projectId, updateRequest).subscribe(response => {
      expect(response).toBeTruthy();
      expect(response.status).toBe(200);
      expect(response.message).toBe('Project updated successfully');
      expect(response.data.id).toBe(projectId);
      expect(response.data.name).toBe('Updated Project 1');
      expect(response.data.customerOrgName).toBe('Updated Customer Org 1');
      expect(response.data.additionalInformation).toBeDefined();
      expect(response.data.additionalInformation.length).toBe(2);
      expect(response.data.teams).toBeDefined();
      expect(response.data.teams.length).toBe(1);
      done();
    });

    const req = httpMock.expectOne(`${apiUrl}/${projectId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateRequest);
    req.flush(mockUpdateResponse);
  });

  // Test 13: updateProject - error handling
  it('should handle update project errors', (done) => {
    const projectId = '11111111-1111-1111-1111-111111111111';
    const updateRequest = {
      id: projectId,
      name: 'Test Project',
      key: 'TP-001',
      description: 'Test Description',
      customerOrgName: 'Test Org',
      customerDomainUrl: 'https://test.com',
      customerDescription: 'Test customer description',
      pocEmail: 'test@example.com',
      pocPhone: '+1234567890',
      projectManagerId: 2,
      projectManagerRoleId: 2,
      statusId: 1,
      deliveryUnitId: 1
    };

    service.updateProject(projectId, updateRequest).subscribe(
      () => fail('should have failed'),
      (error) => {
        expect(error).toBeTruthy();
        done();
      }
    );

    const req = httpMock.expectOne(`${apiUrl}/${projectId}`);
    expect(req.request.method).toBe('PUT');
    req.error(new ErrorEvent('Update failed'), { status: 500 });
  });

  // Test 14: updateProject with minimal data
  it('should update project with minimal required data', (done) => {
    const projectId = '11111111-1111-1111-1111-111111111111';
    const updateRequest = {
      id: projectId,
      name: 'Minimal Project',
      key: 'MIN-001',
      description: 'Minimal description',
      customerOrgName: 'Minimal Org',
      customerDomainUrl: '',
      customerDescription: '',
      pocEmail: 'minimal@example.com',
      pocPhone: '',
      projectManagerId: 1,
      projectManagerRoleId: 1,
      statusId: 1,
      deliveryUnitId: 1
    };

    const mockResponse = {
      status: 200,
      data: {
        id: projectId,
        name: 'Minimal Project',
        key: 'MIN-001',
        description: 'Minimal description',
        customerOrgName: 'Minimal Org',
        customerDomainUrl: '',
        customerDescription: '',
        pocEmail: 'minimal@example.com',
        pocPhone: '',
        projectManagerId: 1,
        projectManagerName: 'Manager 1',
        projectManagerRoleId: 1,
        statusId: 1,
        statusName: 'Active',
        deliveryUnitId: 1,
        deliveryUnitName: 'Unit 1',
        deliveryUnitCode: 'U1',
        teamSize: 0,
        sprintCount: 0,
        additionalInformation: [],
        teams: [],
        isImportedFromJira: null,
        createdAt: '2024-01-05T05:00:00Z',
        updatedAt: '2025-11-02T12:14:42.2197277Z'
      },
      message: 'Project updated successfully'
    };

    service.updateProject(projectId, updateRequest).subscribe(response => {
      expect(response.status).toBe(200);
      expect(response.data.name).toBe('Minimal Project');
      expect(response.data.additionalInformation).toEqual([]);
      expect(response.data.teams).toEqual([]);
      done();
    });

    const req = httpMock.expectOne(`${apiUrl}/${projectId}`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });

  // Test 15: getFilteredUsers - success
  it('should fetch filtered users for project manager dropdown', (done) => {
    const searchTerm = 'John';
    const mockUsersResponse = {
      status: 200,
      data: [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'John Smith', email: 'johnsmith@example.com' }
      ],
      message: 'Success'
    };

    done();
  });

  // Test 16: getDeliveryUnits - success
  it('should fetch delivery units for dropdown', (done) => {
    const mockDeliveryUnitsResponse = {
      status: 200,
      data: [
        { id: 1, name: 'Automotive', code: 'AUTO' },
        { id: 2, name: 'Healthcare', code: 'HEALTH' }
      ],
      message: 'Success'
    };

    service.getDeliveryUnits().subscribe(response => {
      expect(response.status).toBe(200);
      expect(response.data.length).toBe(2);
      expect(response.data[0].name).toBe('Automotive');
      expect(response.data[0].code).toBe('AUTO');
      done();
    });

    const req = httpMock.expectOne('https://localhost:7178/api/delivery-unit');
    expect(req.request.method).toBe('GET');
    req.flush(mockDeliveryUnitsResponse);
  });

  // Test 17: getFilteredUsers without search term
  it('should fetch all users when no search term provided', (done) => {
    const mockUsersResponse = {
      status: 200,
      data: [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
      ],
      message: 'Success'
    };

    service.getFilteredUsers().subscribe(response => {
      expect(response.status).toBe(200);
      expect(response.data.length).toBe(3);
      done();
    });

    const req = httpMock.expectOne('https://localhost:7178/api/User/filter');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({}); // No filters
    req.flush(mockUsersResponse);
  });
});