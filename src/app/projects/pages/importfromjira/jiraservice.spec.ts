import { TestBed } from '@angular/core/testing';

import { Jiraservice } from './jiraservice';

describe('Jiraservice', () => {
  let service: Jiraservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Jiraservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
