import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  filter,
  map,
  Observable,
  ReplaySubject,
} from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DevLogin, UserProfile } from '@app/models/user';
import { MessageService } from './message.service';
import { PayloadResponse } from '../models/common';
import { isPlatformBrowser } from '@angular/common';
import DummyData from '@data/db.json';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private uri = environment.ssoUri;
  private useDevSign = (environment as any).useDevSign;
  private enableSSO = environment.enableSSO;
  private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject$.asObservable();

  private isDoneLoadingSubject$ = new ReplaySubject<boolean>();
  public isDoneLoading$ = this.isDoneLoadingSubject$.asObservable();
  private ssoSignIn = environment.enableSSO;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private oAuthService = inject(OAuthService);
  private http = inject(HttpClient);
  private message = inject(MessageService);
  private handler = inject(HttpBackend);

  public canActivateProtectedRoutes$: Observable<boolean> = combineLatest([
    this.isAuthenticated$,
    this.isDoneLoading$,
  ]).pipe(map(values => values.every(b => b)));

  private navigateToLoginPage() {
    // TODO: Remember current URL
    this.router.navigateByUrl('/sign-in');
  }

  constructor() {
    if (this.ssoSignIn) {
      this.ssoConfiguration();

      window.addEventListener('storage', event => {
        // The `key` is `null` if the event was caused by `.clear()`
        if (event.key !== 'access_token' && event.key !== null) {
          return;
        }

        // console.warn(
        //   'Noticed changes to access_token (most likely from another tab), updating isAuthenticated'
        // );
        this.isAuthenticatedSubject$.next(
          this.oAuthService.hasValidAccessToken()
        );

        if (!this.oAuthService.hasValidAccessToken()) {
          this.navigateToLoginPage();
        }
      });

      this.oAuthService.events.subscribe(() => {
        this.isAuthenticatedSubject$.next(
          this.oAuthService.hasValidAccessToken()
        );
      });

      this.oAuthService.events
        .pipe(
          filter(e => ['session_terminated', 'session_error'].includes(e.type))
        )
        .subscribe(() => this.navigateToLoginPage());
    }
  }

  ssoConfiguration() {
    const authConfig: AuthConfig = {
      issuer: environment.issuer,
      strictDiscoveryDocumentValidation: false,
      clientId: environment.clientId,
      redirectUri: environment.redirectUri,
      tokenEndpoint: environment.tokenEndpoint,
      dummyClientSecret: environment.dummyClientSecret,
      scope: 'openid profile',
      requireHttps: false,
      oidc: true,
      useSilentRefresh: true,
      requestAccessToken: true,
      showDebugInformation: true,
      responseType: 'code',
    };

    this.oAuthService.configure(authConfig);
    this.oAuthService.setupAutomaticSilentRefresh();
    this.oAuthService
      .loadDiscoveryDocumentAndLogin()
      .then(() => {
        this.isDoneLoadingSubject$.next(true);
        if (
          this.oAuthService.state &&
          this.oAuthService.state !== 'undefined' &&
          this.oAuthService.state !== 'null'
        ) {
          let stateUrl = this.oAuthService.state;
          if (stateUrl.startsWith('/') === false) {
            stateUrl = decodeURIComponent(stateUrl);
          }
          console.log(
            `There was state of ${this.oAuthService.state}, so we are sending you to: ${stateUrl}`
          );
          this.router.navigateByUrl(stateUrl);
        }
      })
      .catch(() => this.isDoneLoadingSubject$.next(true));
  }

  login() {
    this.oAuthService.initImplicitFlow();
  }

  saveToken(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('token', token);
    }
  }

  saveProfile(profile: UserProfile) {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(
        'svdProvId',
        profile.access_token_profile.svc_prov + ''
      );
      sessionStorage.setItem('profile', JSON.stringify(profile));
    }
  }

  fetchProfile() {
    if (environment.useDummyData) {
      return this.http
        .get<any>(`${environment.gateway}user/profile`)
        .pipe(
          catchError((err: HttpErrorResponse) => this.message.multiError(err))
        );
    }
    if (isPlatformBrowser(this.platformId)) {
      return JSON.parse(sessionStorage.getItem('profile') || '{}');
    }
    return {};
  }

  devLogin(params: DevLogin) {
    this.http = new HttpClient(this.handler);
    return this.http
      .post<any>(`${this.uri}token/generate`, params)
      .pipe(
        catchError((err: HttpErrorResponse) => this.message.multiError(err))
      );
  }

  logout() {
    if (this.useDevSign) {
      if (isPlatformBrowser(this.platformId)) {
        sessionStorage.clear();
      }
    } else if (this.enableSSO) {
      this.oAuthService.revokeTokenAndLogout();
      this.oAuthService.logOut();
    }
  }

  getProfile() {
    this.oAuthService.loadUserProfile().then((res: any) => {
      return res.info['unique_name'];
    });
  }

  updatePassword() {
    this.oAuthService.loadUserProfile().then((res: any) => {
      const uri = `${environment.issuer}/portal/updatepassword/?UserName=${res.info['unique_name']}`;
      window.open(uri, '_blank');
    });
  }

  getToken() {
    if (this.useDevSign) {
      if (isPlatformBrowser(this.platformId)) {
        return sessionStorage.getItem('token');
      }
      return '';
    } else {
      return this.oAuthService.getAccessToken();
    }
  }

  isAuthenticated() {
    if (this.useDevSign) {
      if (this.getToken()) {
        return true;
      }
      return false;
    }
    return true;
  }
}
