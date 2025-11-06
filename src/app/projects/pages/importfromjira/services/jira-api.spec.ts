import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { JiraApi } from './jira-api';

describe('JiraApi', () => {
  let service: JiraApi;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(JiraApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
