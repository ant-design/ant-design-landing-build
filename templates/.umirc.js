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
