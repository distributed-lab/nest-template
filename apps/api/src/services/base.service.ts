import { Logger, RequestErrorHandler } from '@common'
import { HttpService } from '@nestjs/axios'
import { HttpException, HttpStatus, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AxiosResponse } from 'axios'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { lastValueFrom, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export class BaseService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) protected readonly logger: Logger,
    protected httpService: HttpService,
    protected configService: ConfigService,
  ) {}

  @RequestErrorHandler()
  public async requestProxy<T = any>(
    urlData: string | string[],
    method = 'GET',
    query?: any,
    config?: any,
  ) {
    const url = this.parseUrl(urlData)

    const timeMark = 'request ' + url
    try {
      this.logger.time(timeMark)

      let request: Observable<AxiosResponse<T>>

      switch (method) {
        case 'GET':
          request = this.httpService.get<T>(url, query)
          break
        case 'POST':
          request = this.httpService.post<T>(url, query, config)
          break
        case 'PUT':
          request = this.httpService.put<T>(url, query, config)
          break
        case 'PATCH':
          request = this.httpService.patch<T>(url, query, config)
          break
      }

      return lastValueFrom(request.pipe(map(response => response.data)))
    } catch (err) {
      this.logger.error(err, err.stack, 'Base service error')
      throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR)
    } finally {
      this.logger.timeEnd(timeMark)
    }
  }

  public buildUrl(host, port?): string {
    let url = `${host}${port ? ':' + port : ''}`
    url += url.charAt(url.length - 1) === '/' ? '' : '/'
    return url
  }

  private parseUrl(url: string | string[]): string {
    if (Array.isArray(url)) {
      return new URL(url[0], url[1]).toString()
    }

    return url
  }
}
