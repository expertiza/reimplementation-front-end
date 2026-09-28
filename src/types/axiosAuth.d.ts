import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
  }
  export interface InternalAxiosRequestConfig {
    skipAuth?: boolean;
  }
}