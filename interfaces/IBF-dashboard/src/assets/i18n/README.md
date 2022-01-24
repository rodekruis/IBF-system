## Workflow for adding/editing layer info popup descriptions

1. [SW-DEV] Keeping rows of file up to date

- The file `layer-popup-info.xlsx` should at any time contain rows for all layers in IBF-dashboard that require popup-texts.
- SW-DEV is responsible for keeping this up to date
- This involves all entries from `indicator-metadata.json` and all 'point' and 'wms' layers from `layer-metadata.json`
- Extend the formula-columns downward

2. [DATA-DEV] Adding/editing info popup

- this is done in column D
- make as much as possible use of existing entries for other countries or layers
- DATA-DEV is responsible for this
- if it is an existing entry, but column D is still empty, start with copying the existing full text from the dashboard
- whenever a change is made, fill in the date of change in column E

3. [DATA-DEV] Check UX copy with HCD

- if necessary, check UX copy with HCD
- make the changes in column D
- update the date of change in column E again
- DATA-DEV is responsible for making the changes

4. [DATA-DEV] Transform text to HTML-compatible text

- DATA-DEV is responsible for this
- Copy the text from column D into column F
- and make HTML-compatible changes where necessary
  - <br> instead of a new line
  - <ul><li>bullet 1</li><li>bullet 2</li></ul> for bullet lists
  - <a href="http://example.com">http://example.com</a> for links
  - etc.
- use e.g. [https://wordtohtml.net/](https://wordtohtml.net/) for this as help
- IMPORTANT: Do not use any double quotes (") in the text, as they may create problems in the conversion later
- update the date of change in column G

5. [DATA-DEV] Upload to Github

- DATA-DEV create a PR with the changed XLSX-file.

6. [SW-DEV] Process into dashboard and review

- SW-DEV checks out PR locally
- runs script to convert XLSX into JSON
  - go to right (this) folder: `cd ./src/assets/i18n`
  - if first time, install 'xlsx'-package: `npm i xlsx`
  - `node _convert-layer-info-popup-xlsx-to-json.js`
- check if dashboard runs without errors
- open popups for added/edited layers to see if text comes out right (use the 'date of change' column G for this)
