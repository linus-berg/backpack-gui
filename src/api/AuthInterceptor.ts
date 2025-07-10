import { AxiosRequestConfig } from 'axios';

export class AuthInterceptor {
  private token_: string = '';
  SetToken(token: string) {
    this.token_ = token;
  }

  Intercept(request: AxiosRequestConfig) {
    request.withCredentials = true;
    return request;
  }
}
