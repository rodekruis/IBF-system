#!/usr/bin/env node

var fs = require('fs');
var XLSX = require('xlsx');

const indicatorMetadata = require('../../../../../services/API-service/src/scripts/json/indicator-metadata.json');
const layerMetadata = require('../../../../../services/API-service/src/scripts/json/layer-metadata.json');

var path = '';
var workbook = XLSX.readFile(path + 'layer-popup-info.xlsx');
var worksheet = workbook.Sheets['data'];

var data = '';
for (z in worksheet) {
  if (z[0] === '!') continue;
  //parse out the column, row, and value
  var tt = 0;
  for (var i = 0; i < z.length; i++) {
    if (!isNaN(z[i])) {
      tt = i;
      break;
    }
  }
  var col = z.substring(0, tt);
  if (col === 'S') {
    var value = worksheet[z].v;
    value = value.replace(/(\r\n|\n|\r)/gm, ''); // Remove linebreaks
    // Enforce that links always open in new tab
    value = value.replace(`target='_blank'`, '');
    value = value.replace('<a ', `<a target='_blank'`);
    data += value;
  }
}
var popupsJson = JSON.parse(data);

for (var indicator of indicatorMetadata) {
  indicator['description'] = popupsJson['layers-section'][indicator.name];
}
for (var layer of layerMetadata) {
  layer['description'] = popupsJson['layers-section'][layer.name];
}

fs.writeFile(
  path + 'indicator-metadata.json',
  JSON.stringify(indicatorMetadata),
  function(err) {
    if (err) {
      return console.log('err', err);
    }
    console.log('Indicator file was saved!');
  },
);

fs.writeFile(
  path + 'layer-metadata.json',
  JSON.stringify(layerMetadata),
  function(err) {
    if (err) {
      return console.log('err', err);
    }
    console.log('Layer file was saved!');
  },
);
