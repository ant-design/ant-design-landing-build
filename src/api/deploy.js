
const nunjucks = require('nunjucks');
const path = require('path');
const { HttpClient2 } = require('urllib');
const Parameter = require('parameter');

async function deploy(ctx, next) {
  const { now } = ctx.config;
  const { token, url, templateDir, whiteList } = now;

  nunjucks.configure(templateDir);
  const pkgTmp = path.join(templateDir, 'package.json');
  const umiTmp = path.join(templateDir, 'umirc');
  const nowIgnoreTmp = path.join(templateDir, 'nowignore');

  const parameter = new Parameter({
    validateRoot: true,
  });

  const {
    name,
    files,
  } = ctx.request.body;
  // console.log('------ctx.request.body-', ctx.request.body);
  const isIncludeName = whiteList.includes(name);

  if (isIncludeName) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      error: 'Params name error',
    }
    return false;
  }
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
      min: 1,
      required: true,
    },
  };
  try {
    // console.log('-validate-', schema, deployData);
    const errors = parameter.validate(schema, deployData);
    // console.log('---errors-', errors);
    if (errors) {
      // console.log('---new Error-');
      throw new Error(errors);
    }
  } catch (e) {
    ctx.status = 400;
    ctx.body = {
      status: 400,
      error: 'Params error',
    }
    return false;
  }

  const pkgContent = nunjucks.render(pkgTmp, {
    name: deployData.name,
  });
  const umiContent = nunjucks.render(umiTmp);
  const nowIgnoreContent = nunjucks.render(nowIgnoreTmp);

  // console.log('---deployData.files-', deployData.files, typeof deployData.files);
  const solidFiles = [
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
      data: nowIgnoreContent,
    },
  ];
  const filterFiles = deployData.files.filter((file) => !solidFiles.map(item => item.file).includes(file.file));

  const concatFiles = solidFiles.concat(filterFiles);
  console.log('---concatFiles-', concatFiles);
  const settings = {
    method: 'POST',
    dataType: 'json',
    contentType: 'json',
    timeout: 50000,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      // 一个站点一个 name
      name: deployData.name,
      public: false,
      version: 2,
      files: concatFiles,
      builds: [
        {
          src: 'package.json',
          use: '@now/static-build',
          config: {
            distDir: 'dist',
          },
        },
      ],
      alias: [
        `${name}.antdlanding.now.sh`
      ]
    },
  };

  const client = new HttpClient2();
  const res = await client.request(`${url}/deployments`, settings);
  console.log('------res-', res);
  ctx.status = 200;
  ctx.body = res.data;
}

module.exports = deploy;
