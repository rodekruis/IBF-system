rm(list=ls())
library(dplyr)
library(tidyverse)
library(raster)
library(sf)
library(velox)
library(stringr)
library(ncdf4)
library(exactextractr)
library(lubridate)
library(ggplot2)
library(ggthemes)

##################################################
################ Load shapefiles ################
##################################################
onedrive_folder <- 'C:/Users/BOttow/Rode Kruis'

zwe_lzh <- st_read(sprintf('%s/510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/zwe_livelihoodzones/ZW_LHZ_2011/ZW_LHZ_2011.shp', onedrive_folder))
zwe_ <- st_read(sprintf('%s/510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/Admin/zwe_admbnda_adm0_zimstat_ocha_20180911/zwe_admbnda_adm0_zimstat_ocha_20180911.shp', onedrive_folder))


## Crop Yield Maize Anomaly ##
df <-read.csv(file ="C:/Users/MPanis/Rode Kruis/510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/zwe_cropyield/all_yield_maize_major.csv" )

# mean value over all years grouped by pcode
ref <- aggregate(yield ~ pcode, df, mean)

#calculute the standard deviation over all years grouped by pcode
std <- aggregate(yield ~ pcode, df, sd)

#combine of the two columns (mean and std)
ref <- left_join(ref, std, by='pcode')

df <- left_join(df, ref, by = 'pcode')

names(df) <- c("pcode", "year", "yield", "mean", "std")

# Calculate anomaly crop yield data
df <- df %>% rowwise() %>% mutate(anomaly = (yield - mean) / std)

#Plot tables where drought occurs (binary 0 no drought year, 1 drought year)
df %>% filter(anomaly < -1) %>% dplyr::select(year, pcode) %>% table()
df %>% filter(anomaly < -1.5) %>% dplyr::select(year, pcode) %>% table()
df %>% filter(anomaly < -2) %>% dplyr::select(year, pcode) %>% table()

for (x in df$pcode %>% unique()) {
  p <- df %>% filter(pcode == x) %>%  ggplot() + geom_line(aes(x = year, y = anomaly)) +
    geom_hline(yintercept=-2, linetype="dashed", color = "red",size=1) +
    geom_hline(yintercept=-1, linetype="dashed", color = "blue",size=.5) + 
    geom_hline(yintercept=0, linetype="dashed", color = "black",size=.1)+ 
    scale_x_date(name="year")+
    #scale_x_date(name="time") + 
    scale_y_continuous(name="Standardized Anomaly Crop Yield")+ 
    geom_rect(data=rect_data, aes(xmin=xmin,xmax=xmax,ymin=ymin,ymax=ymax,fill=col),alpha=0.2)+
    scale_fill_identity()+
    coord_cartesian(ylim=c(-4.0,3.5)) +
    ggtitle('Crop Yield Standardized Anomaly (%s)')+
    theme(text = element_text(size=15),
          axis.text.x = element_text( size = 9, angle = 90,hjust = 1),
          axis.text.y = element_text( size = 10, angle = 0),
          plot.title=element_text(size=18),
          plot.background = element_rect(fill = "transparent",colour = NA))
  
  
  ggsave(filename=sprintf("D:/Drought_IBF/zwe/Anomaly_%s.png", x),plot=p, width = 30, height = 20, units = "cm")
}


# df %>% filter(pcode == "ZW08")  #Check values for a specific pcode

