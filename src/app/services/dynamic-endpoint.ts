import { Injectable, model } from '@angular/core';
import { environment } from '@env/environment';
@Injectable({
  providedIn: 'root',
})
export class DynamicEndpoint {
  private isDynamic = environment.useDynamicEndpoint;
  public setDynamicEndpoint(module: string, uri: string) {
    if (this.isDynamic) {
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const port = window.location.port;

      const url = uri.split(':')[2];

      let endpoint = '';

      url.split('/').forEach((value, index) => {
        if (index != 0 && value != '') {
          endpoint += `${value}/`;
        }
      });

      uri = `${protocol}////${hostname}:${port}/${module}/${endpoint}`;
    }
    return uri;
  }
}
