import { writeFile } from 'fs';
import { config } from 'dotenv';

// Load environment-variables from .env file (if available)
config();

import configFileTemplate from './src/environments/environment.template.ts';
const targetPath = `./src/environments/environment.${process.env.NG_CONFIGURATION}.ts`;

writeFile(targetPath, configFileTemplate, (err) => {
  if (err) {
    console.log(err);
  }

  console.log(`Output generated at ${targetPath}`);
});
