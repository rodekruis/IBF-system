# Script for skill analysis of drought indicators 

## `skill_drought.R`

Some indicator data was extracted per livelihoodzone, some not. The script to calculate skill scores (POD and FAR) of an indicator against impact proxy crop yield per adm2 boundary. 
It is also able to see how many time drought was triggered in the past years. 

The output is a csv with the scores.


### Data input:

The script is now for Zimbabwe, data can be found in the FBF Zimbabwe channel and can be loaded in easily if synced through OneDrive from the IBF channel in Teams.

At the moment, the inputs are `livelyhood zones`, `admin boundaries`, `crop yield` which are as base. Indicators are now included `SPI3`, `DMP`.

For new indicators, the expected format is similar to one of DMP: in csv, with columns:
- adm2 pcode and/ or livelihoodzone pcode as same as those in above files
- date
- values for the indicators


### Usage:

