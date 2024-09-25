## Workflow for adding/editing layer info popup descriptions

1. [SW-DEV] Keeping rows of file up to date

- The file `layer-popup-info.xlsx` should at any time contain rows for all layers in IBF-dashboard that require popup-texts.
- SW-DEV is responsible for keeping this up to date
- This involves all entries from `indicator-metadata.json` and all 'point' and 'wms' layers from `layer-metadata.json`
- To update the `layer-popup-info.xlsx` follow these instructions:
  - from [services\API-service\src\scripts\json](services\API-service\src\scripts\json) folder run `node _add-info-popup-xlsx-columns.js`
    - if first time, install 'xlsx'-package: `npm i xlsx`
  - open the newly created `new-lines.csv` file with a text editor and copy the content
  - open `layer-popup-info.xlsx` and unprotect it (under Review > Unprotect sheet)
  - paste AS VALUES underneath the last updated line
  - unhide columns `H:Q` and check that formula's extend far enough downwards to cover the new rows
  - sort everything (old and new) by the 1st 3 columns (`section`, `layer`, `countryCodeISO3`)
  - hide columns `H:Q` again
  - Protect the sheet again (Review > Protect sheet) with the same password as before

2. [SPD / DATA-DEV] Adding/editing info popup

- Get the latest version of `layer-popup-info.xlsx` from this page on `master` branch.
- Add or edit description in column E
- make as much as possible use of existing entries for other countries or layers
- use HTML tags where applicable
- make sure content is agreed upon between data expert and UX copy owner
- Create a PR on Github with the changed xlsx file and inform a developer. Or alternatively send the xlsx to a developer to do this for you.

3. [SW-DEV] Process into portal and review

- SW-DEV checks out PR locally
- runs script to convert XLSX into JSON
  - go to right (this) folder: `cd services\API-service\src\scripts\json`
  - if first time, install 'xlsx'-package: `npm i xlsx`
  - `node _convert-layer-info-popup-xlsx-to-json.js`
- check if portal runs without errors
- open popups for added/edited layers to see if text comes out right
- Merge PR and check if available on test environment
