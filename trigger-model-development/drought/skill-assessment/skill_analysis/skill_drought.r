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


## LOAD AND CALCULATE CROP YIELD ANOMALY ----
yield_thr = -1

yield <- read.csv(sprintf('%s/510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/zwe_cropyield/all_yield_maize_major.csv',onedrive_folder))

mean_sd <- yield %>% 
  group_by(pcode) %>% 
  summarise(mean = mean(yield,na.rm=TRUE), sd = sd(yield,na.rm=TRUE)) # calculate mean and standard deviation along the year axis
yield <- yield %>%
  left_join(mean_sd,by='pcode')
yield$yield_anomaly <- (yield$yield-yield$mean)/yield$sd       # calculate CYA
yield$yield_drought <- ifelse(yield$yield_anomaly < yield_thr, 1, 0)  # mark if it is drought or not (= if the CYA exceeds the threshold)
yield = subset(yield, select=-c(yield,mean,sd))

df_all <- admin_all %>%    # create joint table with adm2, lhz and yield anomaly
  left_join(yield,by=c('LZCODE'='pcode')) %>%
  dplyr::select(-yield_drought)


## LOAD BIO-INDICATOR ----

## SPI ----
spi_thr = -0.65

spi_zwe <- read.csv(sprintf('%s/510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/zwe_spi/zwe_spi3.csv',onedrive_folder))%>%
  mutate(date=ymd(as.Date(date))) %>%
  mutate(year=year(date))

spi_zwe_mean <- spi_zwe %>%        # take mean value among the 3 months of the year
  group_by(year,livelihoodzone) %>%
  summarise(spi_mean=mean(SPI3))  ### to replace column name when reading different SPI/ SPEI
spi_zwe_mean <- spi_zwe_mean %>%
  mutate(spi_drought = ifelse(spi_mean>spi_thr, 0, 1))  # binary logic if the index is higher than the threshold: 0, else 1

df_all <- df_all %>%       # join to a big table
  left_join(spi_zwe_mean, by=c('LZCODE'='livelihoodzone','year')) %>%
  dplyr::select(-spi_drought)
# write.csv(df_all, './output/combined_indicators.csv')

yield_spi <- merge(spi_zwe_mean, yield, 
                   by.x=c("livelihoodzone","year"), by.y=c("pcode","year")) %>%
  left_join(admin_all,by=c('livelihoodzone'='LZCODE'))
yield_spi <- yield_spi %>% 
  group_by(year,ADM2_PCODE) %>%
  summarise(spi_drought_adm=max(spi_drought),
            drought_adm=max(yield_drought,na.rm=TRUE)) #drought by indicator and by yield if set for the adm2 if the indicator and yeild of any lhz is triggered

# FAR, POD, Trigger count
scores_yield_spi <- yield_spi %>%
  mutate(
    hit = spi_drought_adm & drought_adm,                     # hit when it's drought and crop loss
    false_alarm = (spi_drought_adm==1) & (drought_adm==0),   # false alarm when it's drought but not crop loss
    missed = (spi_drought_adm==0) & (drought_adm==1),        # missed when it's not drought but crop loss
    cor_neg = (spi_drought_adm==0) & (drought_adm==0)        
  ) %>%
  group_by(ADM2_PCODE) %>%
  summarise(
    hits = sum(hit),
    false_alarms = sum(false_alarm),
    triggered = hits + false_alarms,
    POD = hits/(hits+sum(missed)),
    FAR = false_alarms/(hits+false_alarms)
  )
write.csv(scores_yield_spi, './output/scores_yield_spi.csv')

scores_yield_spi_shp = merge(zwe, scores_yield_spi, by="ADM2_PCODE")
st_write(scores_yield_spi_shp, './output/scores_yield_spi.shp', append=FALSE)

# plot all scores in shapefile
pod = ggplot() +
  geom_sf(data = scores_yield_spi_shp, aes(fill = POD), # fill by POD
          colour = "black", size = 0.5) +
  scale_fill_gradient(limits = c(0,1), low = "red", high = "white") +
  theme(legend.position="bottom") +
  ggtitle("POD")
far = ggplot() +
  geom_sf(data = scores_yield_spi_shp, aes(fill = FAR), # fill by POD
          colour = "black", size = 0.5) +
  scale_fill_gradient(limits = c(0,1), low = "white", high = "red") +
  theme(legend.position="bottom") +
  ggtitle("FAR")
pod_far <- plot_grid(pod, far)
title <- ggdraw() +
  draw_label(paste("Scores SPI3 vs Maize for Zimbabwe"), fontface='bold')
fig <- plot_grid(title, pod_far, ncol=1, rel_heights=c(0.1, 1))
ggsave(filename='./output/scores_yield_spi.png', plot=fig, width=15, height=10, units="cm")




## DMP ----
dmp_thr = 70

dmp_zwe <- read.csv(sprintf('%s/510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/zwe_dmp/all_dmp.csv',onedrive_folder))%>%
  mutate(date=ymd(as.Date(date))) %>%
  mutate(year=year(date))

dmp_zwe_mean <- dmp_zwe[months(dmp_zwe$date) %in% month.name[1:3],] %>% # subset Jan, Feb, Mar from 1983-2012
  group_by(year,pcode) %>%
  summarise(dmp_mean=mean(dmp))
dmp_zwe_mean <- dmp_zwe_mean %>%
  mutate(dmp_drought = ifelse(dmp_mean>dmp_thr, 0, 1))  # binary logic if the index is higher than the threshold: 0, else 1

df_all <- df_all %>%       # join to a big table
  left_join(dmp_zwe_mean, by=c('LZCODE'='pcode','year')) %>%
  dplyr::select(-dmp_drought)
# write.csv(df_all, './output/combined_indicators.csv')

yield_dmp <- merge(dmp_zwe_mean, yield, by=c("pcode","year")) %>% 
  left_join(admin_all,by=c('pcode'='LZCODE')) %>% 
  group_by(year,ADM2_PCODE) %>%
  summarise(dmp_drought_adm=max(dmp_drought),
            drought_adm=max(yield_drought,na.rm=TRUE)) #drought by indicator and by yield if set for the adm2 if the indicator and yeild of any lhz is triggered

# FAR, POD, Trigger count
scores_yield_dmp <- yield_dmp %>%
  mutate(
    hit = dmp_drought_adm & drought_adm,                     # hit when it's drought and crop loss
    false_alarm = (dmp_drought_adm==1) & (drought_adm==0),   # false alarm when it's drought but not crop loss
    missed = (dmp_drought_adm==0) & (drought_adm==1),        # missed when it's not drought but crop loss
    cor_neg = (dmp_drought_adm==0) & (drought_adm==0)        
  ) %>%
  group_by(ADM2_PCODE) %>%
  summarise(
    hits = sum(hit),
    false_alarms = sum(false_alarm),
    triggered = hits + false_alarms,
    POD = hits/(hits+sum(missed)),
    FAR = false_alarms/(hits+false_alarms)
  )
write.csv(scores_yield_dmp, './output/scores_yield_dmp.csv')

scores_yield_dmp_shp = merge(zwe, scores_yield_dmp, by="ADM2_PCODE")
st_write(scores_yield_dmp_shp, './output/scores_yield_dmp.shp', append=FALSE)

# plot all scores in shapefile
pod = ggplot() +
  geom_sf(data = scores_yield_dmp_shp, aes(fill = POD), # fill by POD
          colour = "black", size = 0.5) +
  scale_fill_gradient(limits = c(0,1), low = "red", high = "white") +
  theme(legend.position="bottom") +
  ggtitle("POD")
far = ggplot() +
  geom_sf(data = scores_yield_dmp_shp, aes(fill = FAR), # fill by POD
          colour = "black", size = 0.5) +
  scale_fill_gradient(limits = c(0,1), low = "white", high = "red") +
  theme(legend.position="bottom") +
  ggtitle("FAR")
pod_far <- plot_grid(pod, far)
title <- ggdraw() +
  draw_label(paste("Scores DMP vs Maize for Zimbabwe"), fontface='bold')
fig <- plot_grid(title, pod_far, ncol=1, rel_heights=c(0.1, 1))
ggsave(filename='./output/scores_yield_dmp.png', plot=fig, width=15, height=10, units="cm")




# ENSO
enso <- read.csv(sprintf("%s/510 - Data preparedness and IBF - [RD] Impact-based forecasting/General_Data/elnino/ENSO.csv",onedrive_folder)) %>%
  gather("MON",'ENSO',-Year) %>% 
  arrange(Year) %>%
  dplyr::mutate(date=seq(as.Date("1950/01/01"), by = "month", length.out = 852))%>%
  filter(date>= as.Date("1980/01/01"))



# IPC 
ipc_zwe <- read.csv(sprintf('%s/510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/zwe_ipc/zwe_ipc.csv',onedrive_folder))%>%
  mutate(date=ymd(as.Date(Date)))
