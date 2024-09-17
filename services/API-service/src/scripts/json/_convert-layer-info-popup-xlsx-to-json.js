#!/usr/bin/env node

const fs = require('fs');
const XLSX = require('xlsx');

const indicatorMetadata = require('../../../../../services/API-service/src/scripts/json/indicator-metadata.json');
const layerMetadata = require('../../../../../services/API-service/src/scripts/json/layer-metadata.json');

const path = '';
const workbook = XLSX.readFile(path + 'layer-popup-info.xlsx');
const worksheet = workbook.Sheets['data'];

let data = '';
for (z in worksheet) {
  if (z[0] === '!') continue;
  //parse out the column, row, and value
  let tt = 0;
  for (let i = 0; i < z.length; i++) {
    if (!isNaN(z[i])) {
      tt = i;
      break;
    }
  }
  const col = z.substring(0, tt);
  const colToProcess = 'P';
  if (col === colToProcess) {
    let value = worksheet[z].v;
    value = value.replace(/(\r\n|\n|\r)/gm, ''); // Remove linebreaks
    // Enforce that links never open in new tab
    value = value.replace(`target='_blank'`, '');
    data += value;
  }
}
const popupsJson = JSON.parse(data);

for (const indicator of indicatorMetadata) {
  indicator['description'] = popupsJson['layers-section'][indicator.name];
}
for (const layer of layerMetadata) {
  layer['description'] = popupsJson['layers-section'][layer.name];
}

fs.writeFile(
  path + 'indicator-metadata.json',
  JSON.stringify(indicatorMetadata),
  function (err) {
    if (err) {
      return console.log('err', err);
    }
    console.log('Indicator file was saved!');
  },
);

fs.writeFile(
  path + 'layer-metadata.json',
  JSON.stringify(layerMetadata),
  function (err) {
    if (err) {
      return console.log('err', err);
    }
    console.log('Layer file was saved!');
  },
);
