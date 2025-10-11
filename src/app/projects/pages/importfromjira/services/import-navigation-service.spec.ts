import { TestBed } from '@angular/core/testing';
import { ImportNavigationService } from './import-navigation-service';

describe('ImportNavigationService', () => {
  let service: ImportNavigationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImportNavigationService);
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
