import { TestBed } from '@angular/core/testing';

import { HaWebsocketService } from './ha-websocket';

describe('HaWebsocketService', () => {
  let service: HaWebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HaWebsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('call() should throw when socket is not open', async () => {
    try {
      await service.call({ type: 'diet/get_capabilities' });
      fail('Expected call to throw when socket not open');
    } catch (err: any) {
      expect(err).toBeTruthy();
      expect((err as Error).message).toContain('WebSocket non connesso');
    }
  });
});
