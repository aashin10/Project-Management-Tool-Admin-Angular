import { TestBed } from '@angular/core/testing';

import { JiraApi } from './jira-api';

describe('JiraApi', () => {
  let service: JiraApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JiraApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
