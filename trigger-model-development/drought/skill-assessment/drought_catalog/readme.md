# Script for creating drought impact catalog

## `impactcatalogue_drought.R`

The script is for arranging predictants (yield, yield anomaly - for maize now) and predictors (drought indicators) per admin2 into a single catalog. 

The arrangement is based on [this excel sheet on Teams ][https://rodekruis.sharepoint.com/sites/510-CRAVK-510/_layouts/15/guestaccess.aspx?guestaccesstoken=5DtgHKRzRrHCPDqpWQl6D1XAJqVfimV3fujFdueQv%2F0%3D&docid=2_027fd1d81d676404d914d155ef55fd16d&rev=1&e=pBm3hv]

The output impact catalog is saved as csv .

### Data input:

The script is now for Zimbabwe, data can be found in the FBF Zimbabwe channel, General_data of IBF channel and can be loaded in easily if synced through OneDrive from the IBF channel in Teams.

At the moment, the inputs are `livelyhood zones`, `admin boundaries`, `crop yield` which are as base. Indicators are now included `ENSO`, `SPI3`, `SPEI3`.

For new indicators, the expected format is similar to one of DMP: in csv, with columns:
- adm2 pcode and/ or livelihoodzone pcode as same as those in above files
- date (year, month)
- values for the indicators


### Usage:

Sections `READ ADMIN AND LIVELIHOODZONE BOUNDARIES` and `LOAD AND CALCULATE CROP YIELD ANOMALY [PREDICTANT]` are fixed to define the data frame. Indicators are loaded and modified manually as following:
- Load the indicator from your synced OneDrive `[indicatorname]_[countryname]`
- Join to the combined table the indicator based on (1) `livelyhood zones` or `admin boundaries`; (2) `year` and `month` (if `month` available).