# ant-design-landing-build

## QuickStart
config `now` token in `config.default.ts`

```js
 config.now = {
    url: 'https://api.zeit.co/v8/now',
    token: 'your token',
    templateDir: path.join(appInfo.baseDir, 'app', 'template'),
  };
```

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### Npm Scripts

- Use `npm run lint` to check code style
- Use `npm test` to run unit test
- se `npm run clean` to clean compiled js at development mode once

### Requirement

- Node.js 8.x
- Typescript 2.8+
