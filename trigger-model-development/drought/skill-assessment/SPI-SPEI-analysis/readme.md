# Script for skill analysis of drought indicators SPI/ SPEI 

## `spi_spei_analysis.R`

The script to calculate skill scores (POD and FAR) of SPI, SPEI vs impact proxy crop yield.

The outputs are figures of SPI/SPEI against crop yield, maps of skill scores per livelihood zones, csv and shapefiles with the scores.

### Usage:

Load input data as instructed in the script, then call the function `skill_analysis` with the correct order of syntax: 

`skill_analysis(si_type, si, si_thr, crop_type, yield.df, yield_anomaly_thr, countryshape, livelyzoneshape)`

Where:

   `si_type`: standardised index type (string)  
   `si`: loaded nc file of the standardised index  
   `si_thr`: the standardised index threshold (single value)  
   `crop_type`: crop yield type (string)  
   `yield.df`: data.frame of the crop yield  
   `yield_anomaly_thr`: crop yield anomaly (single value)  
   `countryshape`: shapefile of country (for cropping global dataset with country extent)  
   `livelyzoneshape`: shapefile of livelihood zones (for calculation)  
   `output_folder`: folder where to save the output  

### Data input:
   `livelyhood zones`: https://fews.net/content/zimbabwe-livelihood-zones-2011<br>
   `admin boundaries`: https://data.humdata.org/dataset/zimbabwe-administrative-levels-0-3-boundaries<br>
   `SPI and SPEI`: https://wci.earth2observe.eu/portal/ <br>
   `crop yield`: https://doi.pangaea.de/10.1594/PANGAEA.909132<br>
All these data can be loaded in easily if synced through OneDrive from the IBF channel in Teams.


## `ecmwf_calculate_spi.R`
The script calculates the SPI with various leadtime based on the ECMWF Precipitation Data extracted from the Climate Data Store -  https://cds.climate.copernicus.eu/cdsapp#!/dataset/seasonal-monthly-single-levels?tab=overview into a global NETCDF File. This dataset can be used to do country-specific spi calculations in combination with the `spi_spei_analysis.R` script. 


### Usage
`spi_type`: fill in the SPI leadtime you are interested in (SPI1 - SPI2 - SPI3 or other)

### Data input
`rain_mean`: 'monthly_ensamble_mean_1993-2016.nc' or 'monthly_mean_1993_2016.nc' - See script: XXX how to download the data from the CDS 
The data also be loaded in easily if synced through OneDrive from the IBF channel in Teams.

### More information
`ecmwf_calculate_spi.R` contact ateklesadik@redcross.nl

