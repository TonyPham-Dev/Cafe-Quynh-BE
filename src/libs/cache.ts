import { RedisClientType, createClient } from 'redis';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class RedisConnection implements OnModuleInit {
  private readonly logger = new Logger('RedisConnection');
  private readonly redisUri: string = `redis://:${this.configService.get(
    'redis.password',
  )}@${this.configService.get('redis.host')}:${this.configService.get('redis.port')}`;
  constructor(private readonly configService: ConfigService) {
    this.redisCacheClient = createClient({ url: this.redisUri });
    this.redisCacheClient.on('connect', () => {
      this.logger.log('Redis connected');
    });
  }

  async onModuleInit() {
    await this.connectRedis();
  }

  private readonly redisCacheClient: RedisClientType;

  private label = 'Redis cache connected';

  public async connectRedis() {
    await this.redisCacheClient.connect();
  }

  public getRedisCacheClient() {
    return this.redisCacheClient;
  }

  public setKeyValueExpire(key: string, data: any, expireInSeconds = 7 * 24 * 60 * 60) {
    return this.redisCacheClient.setEx(`c:${key}`, expireInSeconds, data);
  }

  public async getKey(key: string) {
    return this.redisCacheClient.get(`c:${key}`);
  }

  public async deleteKey(key: string) {
    return this.redisCacheClient.del(`c:${key}`);
  }

  public async getKeyIfNotDoSet(
    key: string,
    handlerReturnData: () => Promise<any>,
    expireInSeconds = 7 * 24 * 60 * 60,
  ) {
    let data = await this.getKey(`c:${key}`);
    if (!data) {
      data = await handlerReturnData();
      await this.setKeyValueExpire(`c:${key}`, data, expireInSeconds);
    }
    return data;
  }
}
