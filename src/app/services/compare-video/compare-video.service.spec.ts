import { TestBed } from '@angular/core/testing';

import { CompareVideoService } from './compare-video.service';

describe('CompareVideoService', () => {
  let service: CompareVideoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompareVideoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
