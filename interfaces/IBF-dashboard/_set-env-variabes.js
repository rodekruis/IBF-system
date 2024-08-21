const fs = require('fs');
const dotenv = require('dotenv');

// Load environment-variables from .env file (if available)
dotenv.config();

const configFileTemplate = require('./src/environments/environment.template.ts');
const targetPath = `./src/environments/environment.${process.env.NG_CONFIGURATION}.ts`;

fs.writeFile(targetPath, configFileTemplate, (err) => {
  if (err) {
    console.log(err);
  }

  console.log(`Output generated at ${targetPath}`);
});
