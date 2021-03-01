
# Calculate baseline impact database
This script calculates the crop yield anomaly and transforms it into a binary classification table for each year and livelihoodzone where drought occurs (binary 0 no drought year, 1 drought year). 

This baseline is used to calculate the Probability of Detection (POD) and False Alarm Ratio (FAR) for various drought indicators (SPI/DMP/VCI/etc.)

## Data input
- `livelihood zones`: https://fews.net/content/zimbabwe-livelihood-zones-2011<br>
- `crop yield data`: https://doi.pangaea.de/10.1594/PANGAEA.909132<br>

OneDrive folder
`livelihood zones`: C:/Users/.../Rode Kruis/510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/zwe_livelihoodzones/ZW_LHZ_2011/
`crop yield maize major`: C:/Users/..../Rode Kruis/510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/zwe_cropyield/.csv
