export const DEBUG = ['production'].indexOf(process.env.NODE_ENV) === -1;
export const AUTH_DEBUG = false;
export const PORT = 3000;
export const SCHEME = DEBUG ? 'http' : 'https';
