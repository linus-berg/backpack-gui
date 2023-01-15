import { AxiosRequestConfig } from 'axios';

export class AuthInterceptor {
  private token_: string = '';
  SetToken(token: string) {
    this.token_ = token;
  }

  Intercept(request: AxiosRequestConfig) {
    request.headers = {
      Authorization: `Bearer ${this.token_}`,
    };
    return request;
  }
}
