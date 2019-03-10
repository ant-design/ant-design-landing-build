// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportApis from '../../../app/controller/apis';
import ExportHome from '../../../app/controller/home';

declare module 'egg' {
  interface IController {
    apis: ExportApis;
    home: ExportHome;
  }
}
