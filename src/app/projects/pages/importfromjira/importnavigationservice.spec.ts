import { TestBed } from '@angular/core/testing';

import { Importnavigationservice } from './importnavigationservice';

describe('Importnavigationservice', () => {
  let service: Importnavigationservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Importnavigationservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
