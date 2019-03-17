export default {
  /**
   * 输出错误的信息，并中断请求
   * @param {String} message 错误文字信息
   * @param {Hash} opts 额外参数，例如 { status: 301 }
   */
  error(msg, opts) {
    opts = opts || { status: 404 };
    opts.msg = msg || opts.msg || '';
    console.log(opts.msg);
    const err: any = new Error('custom-error');
    const res = {
      code: opts.status || 404,
      ...opts,
    };
    err.code = res.code;
    err.body = res;
    err.path = res.path;
    throw err;
  },
  requireParams(schema: object, data: object, msg = '') {
    const ctx: any = this;
    try {
      ctx.validate(schema, data);
    } catch (e) {
      ctx.logger.error('---requireParams---path: ', ctx.path, '--error--', JSON.stringify(e.errors[0]));
      const errorMsg = ctx.app.config.env === 'prod' ? '参数错误' : JSON.stringify(e.errors[0]);
      ctx.error(msg || errorMsg, { status: 400 });
    }
  },
};
