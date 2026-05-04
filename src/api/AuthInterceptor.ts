import { InternalAxiosRequestConfig } from 'axios';

export class AuthInterceptor {
  private token_: string = '';
  SetToken(token: string) {
    this.token_ = token;
  }

  Intercept(request: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    if (this.token_) {
      request.headers.Authorization = `Bearer ${this.token_}`;
    }
    return request;
  }
}
