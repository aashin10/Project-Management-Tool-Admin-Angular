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

  it('should emit next event when onNext is called', (done) => {
    service.next$.subscribe(() => {
      expect(true).toBeTrue();
      done();
    });

    service.onNext();
  });

  it('should emit previous event when onPrevious is called', (done) => {
    service.previous$.subscribe(() => {
      expect(true).toBeTrue();
      done();
    });

    service.onPrevious();
  });
});
