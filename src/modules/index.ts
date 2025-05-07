import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { JobType } from 'src/types/base/job.type';
import { JwtModule } from '@nestjs/jwt';
import configuration from 'src/configs/configuration';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { HttpModule } from '@nestjs/axios';
import { EventEmitterModule } from '@nestjs/event-emitter';

export default [
  JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('authentication.jwtAccessSecret'),
      signOptions: { expiresIn: '7d' },
    }),
    inject: [ConfigService],
  }),
  ConfigModule.forRoot({
    isGlobal: true,
    load: [configuration],
  }),
  ScheduleModule.forRoot(),
  BullModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => {
      const host = configService.get('redis.host');
      const port = configService.get('redis.port');
      const password = configService.get('redis.password');

      console.log(`Redis URI: redis://:${password}@${host}:${port}`);

      return {
        redis: {
          host,
          port,
          password,
        },
      };
    },
    inject: [ConfigService],
  }),
  BullModule.registerQueue({
    name: JobType.SAMPLE_JOB,
  }),
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', '..', '..', 'public/uploads'),
    serveRoot: '/uploads',
  }),
  HttpModule.register({
    timeout: 20000,
    maxRedirects: 5,
  }),
  EventEmitterModule.forRoot(),
];
