import { writeFile, readFileSync } from 'fs';
import { config } from 'dotenv';

config();

const templatePath = './src/environments/environment.template.ts';
const targetPath = `./src/environments/environment.${process.env.NG_CONFIGURATION}.ts`;

let template = readFileSync(templatePath, 'utf8');

template = template.replace(
  /process\.env\[['"]([^'"]+)['"]\]/g,
  (_, varName) => {
    const value = process.env[varName];

    if (['null', 'undefined', 'true', 'false'].includes(value)) return value;

    return `'${value}'`;
  },
);

console.log(`Writing environment file to: ${targetPath}`);

writeFile(targetPath, template, (error) => {
  if (error) {
    console.error(`Error writing environment file: ${error}`);
  }

  console.log(`Output generated at ${targetPath}`);
});
