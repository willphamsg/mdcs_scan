import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private config: any;

  constructor() {}

  loadConfig(): Promise<void> {
    return fetch('assets/app-config.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(config => {
        // console.log('Loaded configuration:', config);
        this.config = config;
      })
      .catch(err => {
        console.error('Failed to load configuration:', err);
      });
  }

  getConfig(key: string): any {
    return this.config ? this.config[key] : null;
  }
}