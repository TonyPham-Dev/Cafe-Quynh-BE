import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import appModules from 'src/modules';
import * as appServices from 'src/services';
import * as appJobs from 'src/jobs/index';
import * as appControllers from 'src/controllers';
import * as appRepositories from 'src/repositories';
import * as strategies from 'src/strategy';
import { RoutesConfiguration } from 'src/middlewares/routes/configuration';
import { convertObjectToArray } from 'src/utils';

@Module({
  imports: appModules,
  controllers: convertObjectToArray(appControllers),
  providers: [
    ...convertObjectToArray(appServices),
    ...convertObjectToArray(appRepositories),
    ...convertObjectToArray(strategies),
    ...convertObjectToArray(appJobs),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    RoutesConfiguration.configure(consumer);
  }
}
