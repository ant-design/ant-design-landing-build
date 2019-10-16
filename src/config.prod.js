const path = require('path');
module.exports = {
  now: {
    token: 'your token',
    url: 'https://api.zeit.co/v8/now',
    templateDir: path.join(__dirname, 'template'),
    whiteList: ['ant-design-landing-build'],
  },
}
