import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { DietService as Diet } from './diet';
import { HaWebsocketService } from './ha-websocket';

describe('DietService', () => {
  let service: Diet;
  let wsSpy: jasmine.SpyObj<HaWebsocketService>;

  beforeEach(() => {
    wsSpy = jasmine.createSpyObj('HaWebsocketService', ['call', 'waitUntilConnected']);
    wsSpy.waitUntilConnected.and.returnValue(Promise.resolve());
    TestBed.configureTestingModule({
      providers: [{ provide: HaWebsocketService, useValue: wsSpy }]
    });
    service = TestBed.inject(Diet);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getCapabilities should call ws.call and return data', async () => {
    wsSpy.call.and.returnValue(Promise.resolve({ subject_profile_id: 1, profiles: [] }));
    const caps = await service.getCapabilities();
    expect(wsSpy.call).toHaveBeenCalledWith({ type: 'diet/get_capabilities' });
    expect(caps.subject_profile_id).toBe(1);
  });
});
