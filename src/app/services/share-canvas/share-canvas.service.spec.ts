import { TestBed } from '@angular/core/testing';

import { ShareCanvasService } from './share-canvas.service';

describe('ShareCanvasService', () => {
  let service: ShareCanvasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShareCanvasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
