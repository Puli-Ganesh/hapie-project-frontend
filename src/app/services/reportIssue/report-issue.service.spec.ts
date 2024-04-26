import { TestBed } from '@angular/core/testing';

import { ReportIssueService } from './report-issue.service';

describe('ReportIssueService', () => {
  let service: ReportIssueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportIssueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
