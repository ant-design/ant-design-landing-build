import { Controller } from 'egg';
import * as path from 'path';
import * as nunjucks from 'nunjucks';
import nanoid from 'nanoid';

export default class APIController extends Controller {
  public pkgTmp: string = '';
  public requestOptions: object = {};
  public umiTmp: string = '';
  public url: string = '';
  constructor(ctx) {
    super(ctx);
    const { now } = ctx.app.config;
    const { token, url, templateDir } = now;
    nunjucks.configure(templateDir);
    this.pkgTmp = path.join(templateDir, 'package.json');
    this.umiTmp = path.join(templateDir, 'umirc.js');
    this.url = url;
    this.requestOptions = {
      dataType: 'json',
      contentType: 'json',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }
  public async queryDeploy() {
    const { ctx } = this;
    const { id } = ctx.params;
    // const id = 'dpl_GEvRmusGWUWxgtJS3SjjayKtXUJ9';
    ctx.logger.info('---id-', id);
    const result = await ctx.curl(`${this.url}/deployments/${id}`, {
      method: 'GET',
      ...this.requestOptions,
    });
    ctx.body = result;
  }
  /**
   * POST /api/publish
   * {
   *
   * }
   */
  public async publish() {
    const { ctx } = this;
    const randomId = nanoid();
    const deployData = {
      name: 'landing-page',
    };

    ctx.logger.debug('---randomId-', randomId);

    const pkgContent = nunjucks.render(this.pkgTmp, {
      name: deployData.name,
    });
    const umiContent = nunjucks.render(this.umiTmp);

    ctx.logger.debug('--pkgContent-', pkgContent);
    ctx.logger.debug('--umiContent-', umiContent);

    const schema = {
      name: 'string',
    };
    ctx.requireParams(schema, deployData);
    const settings: any = {
      method: 'POST',
      ...this.requestOptions,
      data: {
        name: 'ant-design-landing-build',
        version: 2,
        files: [
          {
            file: 'package.json',
            data: `
            {
              "name": "demo",
              "private": true,
              "scripts": {
                "start": "now",
                "dev": "umi dev",
                "build": "umi build",
                "now-build": "umi build"
              },
              "devDependencies": {
                "husky": "^0.14.3",
                "lint-staged": "^7.2.2",
                "now": "^14.0.3"
              },
              "lint-staged": {
                "*.{js,jsx}": [
                  "eslint --fix",
                  "git add"
                ]
              },
              "engines": {
                "node": ">=8.0.0"
              },
              "dependencies": {
                "@now/static-build": "^0.4.18",
                "@zeit/next-less": "^1.0.1",
                "antd": "^3.15.0",
                "babel-plugin-import": "^1.11.0",
                "enquire-js": "^0.2.1",
                "less": "^3.9.0",
                "rc-banner-anim": "^2.2.2",
                "rc-queue-anim": "^1.6.12",
                "rc-scroll-anim": "^2.5.6",
                "rc-tween-one": "^2.3.4",
                "react": "^16.8.4",
                "react-dom": "^16.8.4",
                "umi": "^2.6.1",
                "umi-plugin-react": "^1.6.0"
              }
            }

            `,
          },
          {
            file: 'pages/index.jsx',
            data: `
                import Landing from '../components/index';

                export default () => {
                  return <Landing />;
                }
            `,
          },
          {
            file: 'components/index.jsx',
            data: `
              import React from 'react';
              export default () => <div>Hello now, Hello World</div>;
            `,
          },
          {
            file: '.umirc.js',
            data: `
              export default {
                disableCSSModules: true,
                plugins: [
                  [
                    'umi-plugin-react', {
                      antd: true,
                      dva: false,
                    }
                  ],
                ],
                targets: {
                  ie: 11,
                },
              }
            `,
          },
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
    ctx.logger.info('----result-', result);
    ctx.body = result;
  }
}
