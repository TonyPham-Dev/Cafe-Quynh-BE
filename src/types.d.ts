import { JobType } from 'src/enums';

export type JobsStatus = {
  jobName: string;
  status: boolean;
  type?: JobType;
};

export type T__findUser = {
  skip?: number;
  take?: number;
  cursor?: Prisma.UsersWhereUniqueInput;
  where?: Prisma.UsersWhereInput;
  orderBy?: Prisma.UsersOrderByWithRelationInput;
};
