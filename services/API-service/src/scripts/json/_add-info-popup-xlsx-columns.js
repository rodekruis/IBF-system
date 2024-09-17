#!/usr/bin/env node

const fs = require('fs');
const XLSX = require('xlsx');

const indicatorMetadata = require('../../../../../services/API-service/src/scripts/json/indicator-metadata.json');
const layerMetadata = require('../../../../../services/API-service/src/scripts/json/layer-metadata.json');
const countries = require('../../../../../services/API-service/src/scripts/json/countries.json');

const path = '';
const xlsxFileName = 'layer-popup-info.xlsx';
const csvFileName = 'new-lines.csv';
const sheetName = 'data';

const workbook = XLSX.readFile(path + xlsxFileName);
const worksheet = workbook.Sheets[sheetName];

const sectionNames = {
  generalIndicator: 'layers-section',
  layerIndicator: 'layers-section',
};

const columnsToCheck = ['A', 'B', 'C', 'D'];
const headers = {
  A: 'section',
  B: 'layer',
  C: 'countryCodeISO3',
  D: 'disasterType',
};

const existingDataInXLSX = [];
const indicatorsFromJSON = [];
const indicatorsToAdd = [];

const populateIndicators = () => {
  indicatorMetadata.forEach((indicator) => {
    Object.keys(indicator.countryDisasterTypes).forEach((cc) => {
      const country = countries.find(
        (country) => country.countryCodeISO3 === cc,
      );
      const disasterTypes = indicator.countryDisasterTypes[cc];
      Object.keys(disasterTypes).forEach((disasterType) => {
        if (country.disasterTypes.includes(disasterType)) {
          indicatorsFromJSON.push({
            section: sectionNames.generalIndicator,
            layer: indicator.name,
            countryCodeISO3: cc,
            disasterType: disasterType,
          });
        }
      });
    });
  });

  layerMetadata.forEach((layer) => {
    if (layer.type === 'wms' || layer.type === 'point') {
      Object.keys(layer.description).forEach((cc) => {
        const country = countries.find(
          (country) => country.countryCodeISO3 === cc,
        );
        const disasterTypes = layer.description[cc];
        Object.keys(disasterTypes).forEach((disasterType) => {
          if (country.disasterTypes.includes(disasterType)) {
            indicatorsFromJSON.push({
              section: sectionNames.layerIndicator,
              layer: layer.name,
              countryCodeISO3: cc,
              disasterType: disasterType,
            });
          }
        });
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
    const col = cell.substring(0, cellNumberPos);
    const row = Number(cell.substring(cellNumberPos));

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
        indicator.countryCodeISO3 === xlsxRow.countryCodeISO3 &&
        indicator.disasterType === xlsxRow.disasterType,
    );

    if (index === -1) {
      indicatorsToAdd.push(Object.values(indicator));
    }
  });
};

const writeCSV = () => {
  const lines = indicatorsToAdd.map((i) => i.join('\t'));
  if (!lines.length) {
    console.log('No new lines to write');
    return;
  }
  const csvData = lines.join('\n');
  fs.writeFile(path + csvFileName, csvData, 'utf8', (err) => {
    err ? console.error(err) : console.log(`file ${csvFileName} written`);
  });
};

populateExistingDataInXLSX();
populateIndicators();
compareData();
writeCSV();
