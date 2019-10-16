import * as Koa from "koa";

declare module "koa" {
  export interface BaseContext {
    config: {
      now: {
        token: string;
        url: string;
        templateDir: string;
      }
    };
  }
}
