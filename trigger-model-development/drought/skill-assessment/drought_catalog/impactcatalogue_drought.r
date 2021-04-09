rm(list=ls())
library(tidyverse)
library(lubridate)
library(sf)
library(leaflet)
library(readr)
library(httr)
library(sp)
library(lubridate)
library(ggplot2)
library(ggthemes)
library(cowplot)


onedrive_folder <- "c:/Users/pphung/Rode Kruis"


## READ ADMIN AND LIVELIHOODZONE BOUNDARIES ---- 
zwe_lhz <- st_read(sprintf('%s/510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/zwe_livelihoodzones/ZW_LHZ_2011/ZW_LHZ_2011_fixed.shp',
                           onedrive_folder))
zwe <- st_read(sprintf('%s/510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/Admin/zwe_admbnda_adm2_zimstat_ocha_20180911/zwe_admbnda_adm2_zimstat_ocha_20180911.shp',
                       onedrive_folder))
zwe <- zwe %>%
  dplyr::select(ADM1_PCODE,ADM2_PCODE,ADM0_EN)
zwe_lhz <- zwe_lhz %>%
  dplyr::mutate(ADM0_EN=COUNTRY) %>%
  dplyr::select(LZCODE)

admin_all <- st_intersection(zwe, zwe_lhz) %>%
  dplyr::select(ADM1_PCODE,ADM2_PCODE,LZCODE)
st_geometry(admin_all) <- NULL
# plot(admin_all)


## LOAD AND CALCULATE CROP YIELD ANOMALY [PREDICTANT] ----
months <- c(1:3,9:12)

yield <- read.csv(sprintf('%s/510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/zwe_cropyield/all_yield_maize_major.csv',onedrive_folder))

mean_sd <- yield %>% 
  group_by(pcode) %>% 
  summarise(mean = mean(yield,na.rm=TRUE), sd = sd(yield,na.rm=TRUE)) # calculate mean and standard deviation along the year axis
yield <- yield %>%
  left_join(mean_sd,by='pcode')
yield$yield_anomaly <- (yield$yield-yield$mean)/yield$sd       # calculate CYA
yield = subset(yield, select=-c(mean,sd))

df_all <- admin_all %>%    # create joint table with adm2, lhz and yield anomaly
  left_join(yield,by=c('LZCODE'='pcode')) 

df_all <- df_all[rep(seq_len(nrow(df_all)), each = 7), ] %>%
  group_by(year,LZCODE,ADM2_PCODE) %>%
  mutate(month = months)
df_all <- df_all[,c(1,2,3,4,7,5,6)]    # rearrange column "month"

shift <- function(x, n){    # function to shift row up in a column
  c(x[-(seq(n))], rep(NA, n))
}
df_all$yield <- shift(df_all$yield, 4) # shift yield and yield anomaly so that they start from Sept a year before
df_all$yield_anomaly <- shift(df_all$yield_anomaly, 4)




## LOAD INDICATORS [PREDICTORS] ----


## ENSO current ----

enso_zwe <- read.csv(sprintf('%s/510 - Data preparedness and IBF - [RD] Impact-based forecasting/General_Data/elnino/ENSO.csv',onedrive_folder)) %>%
  # mutate(year=year(Year)) %>%
  dplyr::select(c(Year,OND))     # choose between "OND"/"NDJ" to fit the impact catalogue
colnames(enso_zwe)[colnames(enso_zwe) == 'OND'] <- 'enso_cur'

df_all <- df_all %>%       # join to a big table
  left_join(enso_zwe, by=c('year'='Year'))
df_all$enso_cur[which(df_all$month %in% c(1:3))] <- NA    # remove enso values in JFM



## ENSO forecast ----





## SPI ----

spi_zwe <- read.csv(sprintf('%s/510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/zwe_spi/zwe_spi3.csv',onedrive_folder))%>%
  mutate(date=ymd(as.Date(date))) %>%
  mutate(year=year(date))

df_all <- df_all %>%       # join to a big table
  left_join(spi_zwe, by=c('LZCODE'='livelihoodzone','year','month')) %>%
  dplyr::select(-c(X,date))




## SPEI ----

spei_zwe <- read.csv(sprintf('%s/510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/zwe_spi/zwe_spei3.csv',onedrive_folder))%>%
  mutate(date=ymd(as.Date(date))) %>%
  mutate(year=year(date))

df_all <- df_all %>%       # join to a big table
  left_join(spei_zwe, by=c('LZCODE'='livelihoodzone','year','month')) %>%
  dplyr::select(-c(X,date))
# write.csv(df_all, './output/drought_catalog.csv')




## Soil moisture ----






## VCI ----





## Cumulative precipitation ----



