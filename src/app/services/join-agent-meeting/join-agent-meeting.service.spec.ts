import { TestBed } from '@angular/core/testing';

import { JoinAgentMeetingService } from './join-agent-meeting.service';

describe('JoinAgentMeetingService', () => {
  let service: JoinAgentMeetingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JoinAgentMeetingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
