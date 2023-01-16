#!/usr/bin/env node

var fs = require('fs');
var XLSX = require('xlsx');

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

var translationFile = JSON.parse(fs.readFileSync(path + 'en.json', 'utf8'));
translationFile['layer-info-popups'] = popupsJson;

fs.writeFile(path + 'en.json', JSON.stringify(translationFile), function (err) {
  if (err) {
    return console.log('err', err);
  }
  console.log('The file was saved!');
});
