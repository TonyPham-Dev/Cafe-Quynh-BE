import { MiddlewareConsumer } from '@nestjs/common';
import { AuthenticationRoutesConfig } from 'src/middlewares/routes/authentication.route';
import { GlobalRoutesConfig } from './global.route';

export class RoutesConfiguration {
  static configure(consumer: MiddlewareConsumer) {
    GlobalRoutesConfig.configure(consumer);
    AuthenticationRoutesConfig.configure(consumer);
  }
}
