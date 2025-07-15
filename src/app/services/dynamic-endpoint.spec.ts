import { TestBed } from '@angular/core/testing';
import { DynamicEndpoint } from './dynamic-endpoint';
import { environment } from '@env/environment';

const _window = (): any => {
  return window;
};

class WindowRefService {
  get nativeWindow(): any {
    return _window();
  }
}

describe('DynamicEndpoint', () => {
  let service: DynamicEndpoint;
  let windowRefService: WindowRefService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: WindowRefService, useValue: windowRefService }],
    });
    service = TestBed.inject(DynamicEndpoint);

    windowRefService = {
      nativeWindow: {
        location: {
          hostname: 'aws.com',
          protocol: 'https',
          port: '8060',
        },
      },
    };
  });

  it('should return the original uri when useDynamicEndpoint is false', () => {
    service['isDynamic'] = false;

    const uri = 'test';

    const result = service.setDynamicEndpoint('test', uri);
    expect(result).toBe('test');
  });

  it('should return the dynamic uri when useDynamicEndpoint is true', () => {
    service['isDynamic'] = true;

    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;

    const uri = `${protocol}////${hostname}:${port}/test/test/`;

    expect(
      service.setDynamicEndpoint('test', 'http:////localhost:9876/test/')
    ).toBe(uri);
  });
});
