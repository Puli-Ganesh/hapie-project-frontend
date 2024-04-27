import { TestBed } from '@angular/core/testing';

import { SignedDocumentService } from './signed-document.service';

describe('SignedDocumentService', () => {
  let service: SignedDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignedDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
