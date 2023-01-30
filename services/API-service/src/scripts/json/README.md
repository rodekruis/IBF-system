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

2. [DATA-DEV] Adding/editing info popup

- this is done in column E
- make as much as possible use of existing entries for other countries or layers
- DATA-DEV is responsible for this
- if it is an existing entry, but column E is still empty, start with copying the existing full text from the dashboard
- whenever a change is made, fill in the date of change in column F

3. [DATA-DEV] Check UX copy with HCD

- if necessary, check UX copy with HCD
- make the changes in column E
- update the date of change in column F again
- DATA-DEV is responsible for making the changes

4. [DATA-DEV] Transform text to HTML-compatible text

- DATA-DEV is responsible for this
- Copy the text from column E into column G
- and make HTML-compatible changes where necessary
  - <br> instead of a new line
  - <ul><li>bullet 1</li><li>bullet 2</li></ul> for bullet lists
  - <a href="http://example.com">http://example.com</a> for links
  - etc.
- use e.g. [https://wordtohtml.net/](https://wordtohtml.net/) for this as help
- IMPORTANT: Do not use any double quotes (") in the text, as they may create problems in the conversion later
- update the date of change in column H

5. [DATA-DEV] Upload to Github

- DATA-DEV create a PR with the changed XLSX-file.

6. [SW-DEV] Process into dashboard and review

- SW-DEV checks out PR locally
- runs script to convert XLSX into JSON
  - go to right (this) folder: `cd services\API-service\src\scripts\json`
  - if first time, install 'xlsx'-package: `npm i xlsx`
  - `node _convert-layer-info-popup-xlsx-to-json.js`
- check if dashboard runs without errors
- open popups for added/edited layers to see if text comes out right (use the 'date of change' column H for this)
- Merge PR and check if available on test environment

7. [DATA-DEV] Review if popup text comes out as intended

- DATA-DEV checks out popups for added/edited layers to see if text comes out as intended
