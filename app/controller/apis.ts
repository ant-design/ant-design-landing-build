import { Controller } from 'egg';

export default class APIController extends Controller {
  public requestOptions = {};
  constructor(ctx) {
    super(ctx);
    const { now } = ctx.app.config;
    const { token } = now;
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
    const { now } = ctx.app.config;
    const { url } = now;
    const { id } = ctx.params;
    // const id = 'dpl_GEvRmusGWUWxgtJS3SjjayKtXUJ9';
    ctx.logger.info('---id-', id);
    const result = await ctx.curl(`${url}/deployments/${id}`, {
      method: 'GET',
      ...this.requestOptions,
    });
    ctx.body = result;
  }
  public async publish() {
    const { ctx } = this;
    const { now } = ctx.app.config;
    const { url } = now;
    const result = await ctx.curl(`${url}/deployments`, {
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
              export default () => <div>Hello now</div>;
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
    });
    ctx.logger.info('----result-', result);
    ctx.body = result;
  }
}
