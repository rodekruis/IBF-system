library(tidyverse)
library(lubridate)
library(sf)
library(raster)
library(dplyr)
library(tmap)

######################
# read files 
mypath2 = "C:/Users/ATeklesadik/OneDrive - Rode Kruis/Documents/documents/GLOFAS"
mypath3 = "C:/Users/ATeklesadik/Rode Kruis/510 - Data preparedness and IBF - flood_hazard_compiled_from_six_global_models"

glofas_st <- st_read(paste0(mypath2,'/glofas_africa.shp'))
hydrosheds_basins <- st_read(paste0(mypath2,'/hydrosheds_basins/hybas_lake_af_lev06_v1c/hybas_lake_af_lev06_v1c.shp'))

#####################
# make an overlay 

df_gf<- st_join(hydrosheds_basins,glofas_st)%>%drop_na()%>%filter(ID=="G0959")%>%dplyr::select(HYBAS_ID)

raster1<- raster(paste0(mypath3,'/M6_100y.tif'))

raster_crop<-crop(raster1,extent(df_gf))## masking to basin bounding  box 

raster_bsn<-mask(raster_crop,df_gf) # cliping to basin boundary only
gf_st<-glofas_st%>%filter(ID=="G0959")%>%dplyr::select(ID)
plot(raster_bsn)
par(new=T)
point(-0.58, 16.93)
plot(gf_st)

tmap_mode(mode = "view")
tm_shape(df_gf) + tm_borders(col = "black")+
  #tm_raster("raster_bsn", title = "Global Land Cover") +
  tm_shape(gf_st) + tm_symbols(size=0.9,border.alpha = 0.25,col='#045a8d') +
 
 
  #tm_symbols(size=0.25,border.alpha = 0.5,col='#bdbdbd') +
  tm_format("NLD")
tmap_mode(mode = "view")

#####################
# run this script for GLOFS stations 
