import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.get('/', controller.home.index);
  router.get('/api/deploy/:id/events', 'apis.queryDeployLogs')
  router.get('/api/deploy/:id', 'apis.queryDeploy');
  router.post('/api/deploy', 'apis.deploy');

  // TODO add domain
};
