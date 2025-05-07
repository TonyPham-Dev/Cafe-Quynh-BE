import { exec } from 'child_process';
import * as bcrypt from 'bcrypt';
import { MyError } from './error';

export const helper = {
  async runCmd(cmd: string, options: any = {}) {
    const now = new Date();
    return new Promise((resolve: any, reject: any) => {
      exec(cmd, options, async (err, stdout) => {
        if (err) {
          if (options?.timeout) {
            const duration = new Date().getTime() - now.getTime();
            if (duration > options.timeout) {
              return reject(MyError.ServerError(`Timeout after ${duration}ms`));
            }
          }
          return reject(MyError.ServerError(`cant start '${cmd}' ${err}`, err));
        }
        // the *entire* stdout and stderr (buffered)
        return resolve(stdout);
      });
    });
  },

  async hashData(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  },

  async compare(data: string, encrypted: string): Promise<boolean> {
    return bcrypt.compare(data, encrypted);
  },
};
