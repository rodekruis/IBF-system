#!/usr/bin/env node

var fs = require('fs');
const XLSX = require('xlsx');

const indicatorMetadata = require('../../../../../services/API-service/src/scripts/json/indicator-metadata.json');
const layerMetadata = require('../../../../../services/API-service/src/scripts/json/layer-metadata.json');

const path = '';
const xlsxFileName = 'layer-popup-info.xlsx';
const csvFileName = 'new-lines.csv';
const sheetName = 'data';

let workbook = XLSX.readFile(path + xlsxFileName);
let worksheet = workbook.Sheets[sheetName];

const sectionNames = {
  generalIndicator: 'layers-section',
  aggregateIndicator: 'aggregates-section',
  layerIndicator: 'layers-section',
};

const columnsToCheck = ['A', 'B', 'C'];
const headers = { A: 'section', B: 'layer', C: 'countryCodeISO3' };

let existingDataInXLSX = [];
let indicatorsFromJSON = [];
let indicatorsToAdd = [];

const populateIndicators = () => {
  indicatorMetadata.forEach((indicator) => {
    indicator.country_codes.split(',').forEach((cc) => {
      if (cc !== '') {
        indicatorsFromJSON.push({
          section: sectionNames.generalIndicator,
          layer: indicator.name,
          countryCodeISO3: cc,
        });
      }
    });

    indicator.aggregateIndicator.split(',').forEach((cc) => {
      if (cc !== '') {
        indicatorsFromJSON.push({
          section: sectionNames.aggregateIndicator,
          layer: indicator.name,
          countryCodeISO3: cc,
        });
      }
    });
  });

  layerMetadata.forEach((layer) => {
    if (layer.type === 'wms' || layer.type === 'point') {
      layer.country_codes.split(',').forEach((cc) => {
        if (cc !== '') {
          indicatorsFromJSON.push({
            section: sectionNames.layerIndicator,
            layer: layer.name,
            countryCodeISO3: cc,
          });
        }
      });
    }
  });
};

const populateExistingDataInXLSX = () => {
  for (cell in worksheet) {
    if (cell[0] === '!') continue;
    let cellNumberPos = 0;
    for (let i = 0; i < cell.length; i++) {
      if (!isNaN(cell[i])) {
        cellNumberPos = i;
        break;
      }
    }
    let col = cell.substring(0, cellNumberPos);
    let row = Number(cell.substring(cellNumberPos));

    if (!columnsToCheck.includes(col)) {
      continue;
    }

    if (row === 1) {
      continue;
    }

    const index = existingDataInXLSX.findIndex((r) => r.row === row);

    index === -1
      ? existingDataInXLSX.push({ row, [headers[col]]: worksheet[cell].v })
      : (existingDataInXLSX[index] = {
          ...existingDataInXLSX[index],
          [headers[col]]: worksheet[cell].v,
        });
  }
};

const compareData = () => {
  indicatorsFromJSON.forEach((indicator) => {
    const index = existingDataInXLSX.findIndex(
      (xlsxRow) =>
        indicator.section === xlsxRow.section &&
        indicator.layer === xlsxRow.layer &&
        indicator.countryCodeISO3 === xlsxRow.countryCodeISO3,
    );

    if (index === -1) {
      indicatorsToAdd.push(Object.values(indicator));
    }
  });
};

const writeCSV = () => {
  const lines = indicatorsToAdd.map((i) => i.join('\t'));
  const csvData = lines.join('\n');
  fs.writeFile(path + csvFileName, csvData, 'utf8', (err) => {
    err ? console.error(err) : console.log(`file ${csvFileName} written`);
  });
};

populateExistingDataInXLSX();
populateIndicators();
compareData();
writeCSV();
