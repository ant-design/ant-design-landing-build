const Koa = require("koa");
const logger = require("koa-logger");
const bodyParser = require("koa-bodyparser");
const Router = require('koa-router');
const cors = require('@koa/cors');
const queryDeploy = require('./api/queryDeploy');
const deploy = require('./api/deploy');
const Config = require('./config.prod');

const app = new Koa();
const router = new Router();

Object.assign(app.context, {
  config: Config,
});

router.get('/', (ctx, next) => {
  ctx.body = {
    'Hello': 'antd landing builds',
  }
});
router.get('/api/deploy/:id', queryDeploy);
router.post('/api/deploy', deploy);
router.options('/api/deploy', async (ctx) => {
  ctx.status = 200;
  ctx.body = {
    message: 'ok',
  }
});

app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Request-Method', 'GET,HEAD,PUT,POST,DELETE,HEAD,OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Content-type');
  await next();
})
app.use(logger());
app.use(bodyParser());
app.use(router.routes())
app.use(router.allowedMethods());
app.use(cors({
  origin(ctx) {
    // TODO
    return '*';
  },
}));
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
});

if (process.env.NODE_ENV === 'development') {
  app.listen(3000);
}

module.exports = app.callback();
