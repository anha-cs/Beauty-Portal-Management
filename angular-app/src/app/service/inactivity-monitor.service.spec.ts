import { TestBed } from '@angular/core/testing';

import { InactivityMonitorService } from './inactivity-monitor.service';

describe('InactivityMonitorService', () => {
  let service: InactivityMonitorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InactivityMonitorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
