// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  // API
  api_url: 'http://localhost:3000/api/',

  // feature-flags
  useServiceWorker: false,

  // geoserver
  geoserver_url: 'https://ibf-test.510.global/geoserver/ibf-system/wms',

  // version
  ibf_system_version: 'v0.0.0',

  // video url
  ibf_video_url: 'https://www.youtube-nocookie.com/embed/O0PwZSpEhhc',
};
