export const DEBUG = ['production', 'test'].indexOf(process.env.NODE_ENV) < 0;
export const PORT = 3000;
export const SCHEME = DEBUG ? 'http' : 'https';
