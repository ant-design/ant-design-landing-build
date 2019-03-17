import { Context } from 'egg';

export default function handleError(): any {
  return async (ctx: Context, next: () => Promise<any>) => {
    try {
      await next();
    } catch (err) {
      if (err.message === 'custom-error') {
        ctx.logger.error('Custom Error logger: path', ctx.path, 'info: ', err);
        ctx.status = err.code || 400;
        ctx.body = err.body;
      }
    }
  };
}
