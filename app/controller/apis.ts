import { Controller } from 'egg';
import * as path from 'path';
import * as nunjucks from 'nunjucks';
import nanoid from 'nanoid';

export default class APIController extends Controller {
  public pkgTmp: string = '';
  public requestOptions: object = {};
  public umiTmp: string = '';
  public url: string = '';
  public nowIgnoreTmp: string = '';

  constructor(ctx) {
    super(ctx);
    const { now } = ctx.app.config;
    const { token, url, templateDir } = now;
    nunjucks.configure(templateDir);
    this.pkgTmp = path.join(templateDir, 'package.json');
    this.umiTmp = path.join(templateDir, 'umirc.js');
    this.nowIgnoreTmp = path.join(templateDir, 'nowignore');
    this.url = url;
    this.requestOptions = {
      dataType: 'json',
      contentType: 'json',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }
  /**
   * GET /api/deploy/:buildId/events
   * 查看构建日志
   */
  public async queryDeployLogs() {
    const { ctx } = this;
    const { id } = ctx.params;

    ctx.requireParams({
      id: 'string',
    }, ctx.params);
    const result = await ctx.curl(`${this.url}/deployments/${id}/events`, {
      method: 'GET',
      ...this.requestOptions,
    });
    ctx.result(result);
  }
  /**
   * GET /api/deploy/:buildId
   * 根据构建 id 查询，当前构建是否成功
   * 返回
   * {
   *   "data": {
   *      // 当前部署状态
   *      "readyState": INITIALIZING, ANALYZING, BUILDING, DEPLOYING, READY, or ERROR.
   *      // 部署的站点 url
   *      "url": ""
   *      // 站点 alias 自定义域名
   *      "aliasFinal": []
   *      //
   *    }
   * }
   */
  public async queryDeploy() {
    const { ctx } = this;
    const { id } = ctx.params;

    ctx.requireParams({
      id: 'string',
    }, ctx.params);
    const result = await ctx.curl(`${this.url}/deployments/${id}`, {
      method: 'GET',
      ...this.requestOptions,
    });
    ctx.result(result);
  }
  /**
   * POST /api/publish
   * 传参
   * {
   *  // 站点 name
   *  name: string,
   *  // 构建文件
   *  files: [{
   *    // 文件名
   *    file: 'pages/xxx.jsx',
   *    // 文件内容, string
   *    data: '',
   *  }]
   * }
   */
  public async deploy() {
    const { ctx } = this;
    const randomId = nanoid();

    const {
      name,
      files,
    } = ctx.request.body;
    const deployData = {
      name,
      files,
    };

    const schema = {
      name: {
        type: 'string',
        required: true,
        max: 52,
      },
      files: {
        type: 'array',
        itemType: 'object',
        required: true,
      }
    };
    ctx.requireParams(schema, deployData);

    ctx.logger.debug('---randomId-', randomId);

    const pkgContent = nunjucks.render(this.pkgTmp, {
      name: deployData.name,
    });
    const umiContent = nunjucks.render(this.umiTmp);
    const nowIgnoreTmp = nunjucks.render(this.nowIgnoreTmp);

    ctx.logger.debug('--pkgContent-', pkgContent);
    ctx.logger.debug('--umiContent-', umiContent);

    const settings: any = {
      method: 'POST',
      ...this.requestOptions,
      data: {
        // 一个站点一个 name
        name: deployData.name,
        public: false,
        version: 2,
        files: [
          ...deployData.files,
          {
            file: 'package.json',
            data: pkgContent,
          },
          {
            file: '.umirc.js',
            data: umiContent,
          },
          {
            file: '.nowignore',
            data: nowIgnoreTmp,
          }
        ],
        builds: [
          {
            src: 'package.json',
            use: '@now/static-build',
            config: {
              distDir: 'dist',
            },
          },
        ],
      },
    };
    ctx.logger.debug('settings', settings);
    const result = await ctx.curl(`${this.url}/deployments`, settings);

    ctx.result(result);
  }
}
