import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
  validate: {
    enable: true,
    package: 'egg-validate',
  },
};

export default plugin;
