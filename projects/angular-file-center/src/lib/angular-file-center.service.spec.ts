import { TestBed } from '@angular/core/testing';

import { AngularFileCenterService } from './angular-file-center.service';

describe('AngularFileCenterService', () => {
  let service: AngularFileCenterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AngularFileCenterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
