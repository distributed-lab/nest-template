import { Logger } from '@common/logger'
import { HttpModule as AxiosHttpModule, HttpService } from '@nestjs/axios'
import { Global, Inject, Module, OnModuleInit } from '@nestjs/common'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'

import {
  createReqInterceptor,
  createRespFailInterceptor,
  createRespSuccessInterceptor,
} from './http.interceptors'

@Global()
@Module({
  imports: [AxiosHttpModule],
  exports: [AxiosHttpModule],
})
export class HttpModule extends AxiosHttpModule implements OnModuleInit {
  constructor(
    private readonly httpService: HttpService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {
    super()
  }

  public onModuleInit(): any {
    const axios = this.httpService.axiosRef

    let key: string
    axios.interceptors.request.use(createReqInterceptor(this.logger, key))
    axios.interceptors.response.use(
      createRespSuccessInterceptor(this.logger, key),
      createRespFailInterceptor(this.logger, key),
    )
  }
}
