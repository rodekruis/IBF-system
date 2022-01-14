#!/usr/bin/env node

const fs = require('fs');
var XLSX = require('xlsx');
var workbook = XLSX.readFile('layer-popup-info.xlsx');

var worksheet = workbook.Sheets['Sheet1'];
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
  if (col === 'P') {
    var value = worksheet[z].v;
    data += value;
  }
}

fs.writeFile('layer-popup-info.json', data, function (err) {
  if (err) {
    return console.log(err);
  }
  console.log('The file was saved!');
});
