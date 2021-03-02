require(SPEI)
require(ncdf4)
require(Hmisc)
library(lubridate)
library(dplyr) 
library(raster) 
 

##################################################
############# Calculating SPI for average rainfall 
##################################################

# Define path  
#path='C:/Users/ATeklesadik/OneDrive - Rode Kruis/Documents/documents/IBF-system/trigger-model-development/drought/skill-assessment/ECMWF_reforecast/'
path ='C:/Users/MPanis/Rode Kruis/510 - Data preparedness and IBF - [RD] Impact-based forecasting/General_Data/ecmwf/'

#load rainfall data  ensamble mean 1993-2016 netcdf file with dimension of longitude, latitude and time
#rain_mean<-brick(sprintf("%s/510 - Data preparedness and IBF - [RD] Impact-based forecasting/General_data/ecmwf/monthly_ensamble_mean_1993_2016.nc", path))
rain_mean <-nc_open(paste0(path,'monthly_ensamble_mean_1993_2016.nc'))

#name of standardized index (i.e: SPI1, SPI2 and SPI3) for naming graphs and files; Choose your SPI period of interest and change the number. 
spi_type = 2


time <- ncvar_get(rain_mean, "time")
data <- ncvar_get(rain_mean, "tprate") 
start_date <- ymd("1993-01-01")


#Define date variable to define timeseries 
date=start_date + months(seq(0,287,1))

#Create an array for the SPI data, we are calculating SPI for ensemble mean rainfall :
DATA_SPI <- array(NA, c(360, 181, 288)); #dimension of tprate


for(i in 1:360){for(j in 1:181){
  df<-data.frame(rain=data[i,j,],time=date)%>%
    dplyr::mutate(PRCP=1000*rain*24*60*60*monthDays(time),YEAR=year(date),MONTH=month(date))%>% #calcule the rainfall unit from m/s to mm/month
    dplyr::select(YEAR,MONTH,PRCP)
  
  SPI = spi(ts(df$PRCP, freq=12,start=c(1993,1)),scale = spi_type, distribution = 'Gamma')
  DATA_SPI[i,j,]=c(t(SPI$fitted))}}

lats<-ncvar_get(rain_mean, "latitude")  
lons<-ncvar_get(rain_mean, "longitude") 

dimTime <- ncdim_def(name='time',units='hours since 1900-01-01', calendar="gregorian", vals=time)
varlat <-ncdim_def(name='latitude', units='degrees_north',vals=lats)
varlon <- ncdim_def(name='longitude', units='degrees_east',vals=lons)

 
# Make variable #How can I change the name that it links to the spi_type
#---------
 var_temp <- ncvar_def( name=sprintf("spi%d", spi_type), units = '', list(varlon,varlat,dimTime), missval=-9999,prec = 'double',longname=sprintf("Standard precipitation index%d", spi_type, 'month'))

#---------------------
# Make new output file
#---------------------
output_fname <- paste0(path,'spi', spi_type, '_ensamble_month.nc')
spi_month <- nc_create( output_fname, list(var_temp))

#-------------------------------
# Put data in the file
#-------------------------------
ncvar_put( spi_month, var_temp, DATA_SPI, start=c(1,1,1), count=c(360,181,288))

#--------------------------
# Close output file
#--------------------------
nc_close( spi_month )



##################################################
############# Calculating SPI for ensamble member
##################################################

############# Load rainfall data, rainfall data has a dimension of Lon,lat,ensamble,time
rain_mean<-nc_open(paste0(path,'monthly_mean_1993_2016.nc')) #shouldn't this be the ensamble file and the other one the mean?


time <- ncvar_get(rain_mean, "time")
data <- ncvar_get(rain_mean, "tprate") 
start_date <- ymd("1993-01-01")


#Define date variable to define timeseries 
date=start_date + months(seq(0,287,1))

#Create an array for the SPI data, we are calculating SPI1,SPI2 and SPI3 :
#DATA_SPI1 <- array(NA, c(360, 181, 25,288)); 
#DATA_SPI2 <- array(NA, c(360, 181, 25,288)); 
DATA_SPI_ <- array(NA, c(360, 181, 25,288)); #four dimensions, whereby the 25 is the number of ensamble members


#Loop over lan,lon and ensamble
# calculate SPI1,SPI2 and SPI3 values
# and add data to array defined above
#25 referece to the 25 ensamble members 

for(i in 1:360){for(j in 1:181){for(z in 1:25){
  df<-data.frame(rain=data[i,j,z,],time=date)%>%
    dplyr::mutate(PRCP=1000*rain*24*60*60*monthDays(time),YEAR=year(date),MONTH=month(date))%>%
    dplyr::select(YEAR,MONTH,PRCP)
  
  SPI_mean = spi(ts(df$PRCP, freq=12,start=c(1993,1)),scale = spi_type, distribution = 'Gamma')
  DATA_SPI_[i,j,z,]=c(t(SPI_mean$fitted))}}}


lats<-ncvar_get(rain_mean, "latitude")
lons<-ncvar_get(rain_mean, "longitude")
varens <-ncvar_get(rain_mean, "number")

dimTime <- ncdim_def(name='time',units='hours since 1900-01-01', calendar="gregorian", vals=time)
varlat <-ncdim_def(name='latitude', units='degrees_north',vals=lats)
varlon <- ncdim_def(name='longitude', units='degrees_east',vals=lons)
varens <- ncdim_def(name='ensamble', units='number',vals=varens)

# Make variable
#---------
var_temp <- ncvar_def( name=sprintf("spi%d", spi_type), units = '', list(varlon,varlat,varens,dimTime), missval=-9999,prec = 'double',longname=sprintf("Standard precipitation index%d", spi_type, 'month') )

#---------------------
# Make new output file
#---------------------
output_fname <- paste0(path,'spi',spi_type, '_month.nc')
spi_month <- nc_create( output_fname, list(var_temp))

#-------------------------------
# Put data in the file
#-------------------------------
ncvar_put( spi_month, var_temp, DATA_SPI_mean, start=c(1,1,1,1), count=c(360,181,25,288))

#--------------------------
# Close output file
#--------------------------
nc_close( spi_month )




