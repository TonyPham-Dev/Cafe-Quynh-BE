import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobsStatus } from 'src/types';
import { JobType } from 'src/types/base/job.type';

@Injectable()
class JobsService {
  public job: JobsStatus;

  constructor(jobStatus: JobsStatus) {
    this.job = jobStatus;

    console.log('Job service created');
  }

  @Cron(CronExpression.EVERY_SECOND)
  handle() {
    switch (this.job.type) {
      case JobType.SAMPLE_JOB:
        if (this.job.status) {
          const getResultFromAIService = () => {
            console.log('sample jobs');
          };
          getResultFromAIService();
        }
        break;
      default:
        break;
    }
  }
}
