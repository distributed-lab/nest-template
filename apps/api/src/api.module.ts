import { ExampleController } from '@api/controllers'
import { HealthModule } from '@api/modules'
import {
  AllExceptionsFilter,
  basicInterceptors,
  config,
  getWinstonParams,
  HttpModule,
  loadConfiguration,
  Logger,
  LogRequest,
} from '@common'
import { CacheModule } from '@nestjs/cache-manager'
import { Inject, MiddlewareConsumer, Module, NestModule, OnModuleInit } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { ApiVersionGuard } from '@nestjsx/api-version'
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston'

@Module({
  imports: [
    ConfigModule.forRoot(config),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ttl: configService.get('redis.ttl'),
      }),
      inject: [ConfigService],
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getWinstonParams,
    }),
    HttpModule,
    HealthModule,
  ],
  controllers: [ExampleController],
  providers: [
    ...basicInterceptors,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ApiVersionGuard,
    },
  ],
})
export class AppModule implements OnModuleInit, NestModule {
  constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger) {}

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LogRequest).forRoutes('*')
  }

  onModuleInit(): void {
    const { nodeEnv, app } = loadConfiguration()
    this.logger.log(
      {
        nodeEnv,
        ...app,
      },
      'App',
    )
  }
}
