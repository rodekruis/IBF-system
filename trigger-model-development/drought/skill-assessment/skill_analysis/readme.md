# Script for skill analysis of drought indicators 

## `skill_drought.R`

Some indicator data was extracted per livelihoodzone, some not. The script to calculate skill scores (POD and FAR) of an indicator against impact proxy crop yield per adm2 boundary. 
It is also able to see how many time drought was triggered in the past years. 

The outpus per indicator are a csv, a plot for the scores and a shapefile of adm2. A combined table of yield anomaly and the indicators per year are also exported.


### Data input:

The script is now for Zimbabwe, data can be found in the FBF Zimbabwe channel and can be loaded in easily if synced through OneDrive from the IBF channel in Teams.

At the moment, the inputs are `livelyhood zones`, `admin boundaries`, `crop yield` which are as base. Indicators are now included `SPI3`, `SPEI3`, `DMP`.

For new indicators, the expected format is similar to one of DMP: in csv, with columns:
- adm2 pcode and/ or livelihoodzone pcode as same as those in above files
- date
- values for the indicators


### Usage:

Sections `READ ADMIN AND LIVELIHOODZONE BOUNDARIES` and `LOAD AND CALCULATE CROP YIELD ANOMALY` are fixed to define the data frame. Indicators are loaded and modified manually as following:
- Set the threshold for `[indicatorname]_thr`
- Load the indicator from your synced OneDrive `[indicatorname]_[countryname]`
- Join the indicator to the combined table
- As of now, yearly mean value of the indicator is used to set if it was drought based on the indicator (indicator value exceeded the threshold).
- Calculate the scores per adm2.
- Export and plot the results.