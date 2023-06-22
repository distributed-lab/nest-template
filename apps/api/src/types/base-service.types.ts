export interface IBaseService {
  url: string
  requestProxy(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH',
    query?: any,
    config?: any,
  ): any
  isHealthy?(): any
}
