import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SuperAdminService } from './super-admin-service';

describe('SuperAdminService', () => {
  let service: SuperAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(SuperAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
