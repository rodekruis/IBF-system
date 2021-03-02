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

onedrive_folder <- 'C:/Users/MPanis/Rode Kruis'

zwe_lzh <- st_read('C:/Users/MPanis/Rode Kruis/510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/zwe_livelihoodzones/ZW_LHZ_2011/ZW_LHZ_2011.shp')
zwe_ <- st_read('C:/Users/MPanis/Rode Kruis/510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/Admin/zwe_admbnda_adm0_zimstat_ocha_20180911/zwe_admbnda_adm0_zimstat_ocha_20180911.shp')


##################################################
##################### ENSO ######################
##################################################

#El-Niño Southern Oscillation (https://origin.cpc.ncep.noaa.gov/products/analysis_monitoring/ensostuff/ONI_v5.php)
ENSO <- read.csv("C:/Users/MPanis/Rode Kruis/510 - Data preparedness and IBF - [RD] Impact-based forecasting/General_Data/elnino/ENSO.csv")

#Arrange data into - p is positive value, n is negative value (either El Nino or La Nina)
ENSO<-ENSO %>% gather("MON",'ONI',-Year) %>% arrange(Year) %>%  mutate(dates_=seq(as.Date("1950/01/01"), by = "month", length.out = 852),
                                                                       col = ifelse(ONI>=0,'p', 'n'))%>%filter(dates_ >= as.Date("1980/01/01"))

#Plot ENSO Time-serie with vertical lines presenting drought years, based on anomaly crop yield = -1 identifying a drought year yes=1 or no=0
ensograp<-ggplot() + geom_area(data=ENSO, aes(x=dates_, y=ONI)) +
  geom_hline(yintercept=2, linetype="dashed", color = "red") +
  geom_hline(yintercept=1, linetype="dashed", color = "red") +
  geom_hline(yintercept=-1.0, linetype="dashed", color = "blue") +
  geom_hline(yintercept=-2.0, linetype="dashed", color = "blue") +
  geom_vline(xintercept = as.Date("1992/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("1995/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2002/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2005/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2008/01/01"),color='#f03b20',size=.3) + 
  geom_vline(xintercept = as.Date("2009/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2015/01/01"),color='#f03b20',size=.3) +
  scale_x_date(name="time",date_breaks="24 months")+
  #scale_x_date(name="time") + 
  scale_y_continuous(name="SST anomalies") + 
  coord_cartesian(ylim=c(-2,2.5)) +
  ggtitle('3 month running mean of ERSST.v5 SST anomalies in the Ni?o  3.4 region \n (5oN-5oS, 120o-170oW)')+
  theme(text = element_text(size=15),
        axis.text.x = element_text( size = 9, angle = 90,hjust = 1),
        axis.text.y = element_text( size = 10, angle = 0),
        plot.title=element_text(size=18),
        plot.background = element_rect(fill = "transparent",colour = NA)) 

ggsave(filename=paste0("C:/Users/MPanis/Rode Kruis/510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/enso/",'enso_.png'),plot=ensograp, width = 30, height = 20, units = "cm")
