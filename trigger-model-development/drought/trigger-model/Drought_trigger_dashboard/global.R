rm(list=ls())
library(shiny)
library(janitor)
library(tidyverse)
library(lubridate)
library(plotly)
library(shinydashboard)
library(sf)
library(leaflet)
library(readr)
library(httr)
library(zoo)
library(sp)
#library(ncdf4)
#library(exactextractr)
library(lubridate)
#library(plyr)
#library(dplyr)
#library(lwgeom)




#work_dir<-'C:/Users/ATeklesadik/OneDrive - Rode Kruis/Documents/documents/IBF-system/trigger-model-development/drought/Drought_trigger_dashboard/'
#setwd(work_dir)

setwd(dirname(rstudioapi::getSourceEditorContext()$path))

source('./r_resources/plot_functions.R')
source('./r_resources/misc_functions.R')
source('r_resources/Geo_settings.R')


#---------------------- setting -------------------------------

crs1 <- "+proj=longlat +datum=WGS84 +no_defs +ellps=WGS84 +towgs84=0,0,0"

countries <- c("Kenya" = 1, "Ethiopia" = 2)
levels <- c("LEVEL 2" = 2, "LEVEL 3" = 3)

settings <- country_settings
url<- parse_url(url_geonode)

country="ethiopia"
for (elm in  names(eval(parse(text=paste("settings$",country,sep="")))))
{
  assign(paste0(elm),download.features.geonode(country, elm))
  print(elm)
}


country="kenya"
for (elm in  names(eval(parse(text=paste("settings$",country,sep=""))))){
  assign(paste0(country,"_",elm), download.features.geonode(country, elm))
}

country="SA_region"
for (elm in  names(eval(parse(text=paste("settings$",country,sep=""))))){
  assign(paste0(country,"_",elm), download.features.geonode(country, elm))
}


###########3read admin boundaries 

Ethiopia <- Ethiopia%>% #sf::read_sf("./shapefiles/Ethiopia/eth-administrative-divisions-shapefiles/eth_admbnda_adm2_csa_bofed_20201008.shp")%>%
  dplyr::select(ADM1_PCODE,ADM2_PCODE,ADM0_EN)

SA_admin2_region <-SA_admin2_region%>%#sf::read_sf("./shapefiles/SA_admin2_region.shp")
kenya<- sf::read_sf("./shapefiles/kenya/KEN_Adm2.shp")%>%
  dplyr::mutate(ADM1_PCODE=DSCodeAdm1,ADM2_PCODE=DSCodeAdm2,ADM0_EN='KENYA')%>%
  dplyr::select(ADM1_PCODE,ADM2_PCODE,ADM0_EN)

Mozambique_lhz <-Mozambique_lhz%>%#sf::read_sf("./shapefiles/MZ_LHZ_2013.shp")%>%
  dplyr::mutate(ADM1_PCODE=LZCODE,ADM2_PCODE=LZCODE,ADM0_EN=COUNTRY)%>%
  dplyr::select(ADM1_PCODE,ADM2_PCODE,ADM0_EN)
Lesotho_lhz <-Lesotho_lhz%>%#sf::read_sf("./shapefiles/LS_LHZ_2011.shp")%>%
  dplyr::mutate(ADM1_PCODE=LZCODE,ADM2_PCODE=LZCODE,ADM0_EN=COUNTRY)%>%
  dplyr::select(ADM1_PCODE,ADM2_PCODE,ADM0_EN)

Ethiopia_lhz <-Ethiopia_lhz%>% #sf::read_sf("./shapefiles/Ethiopia/ET_LHZ_2018/ET_LHZ_2018.shp")%>%
  dplyr::mutate(ADM1_PCODE=LZCODE,
                meher=ifelse(grepl("Cropping-Meher", LZTYPE),1,0),
                belge=ifelse(grepl("Cropping-Belg", LZTYPE),2,0),
                Agropastoral=ifelse(grepl("Agropastoral", LZTYPE),3,0),
                pastoral=ifelse(grepl("Pastoral", LZTYPE),4,0),
                crop_calander=meher+belge+Agropastoral+pastoral,
                ADM2_PCODE=LZCODE,
                ADM0_EN=COUNTRY)%>%
  dplyr::select(ADM1_PCODE,ADM2_PCODE,ADM0_EN)#,LZTYPE,crop_calander)

kenya_lhz <- kenya_lhz%>% #sf::read_sf("./shapefiles/kenya/KE_LHZ_2011.shp")%>%
  dplyr::mutate(ADM1_PCODE=LZCODE,ADM2_PCODE=LZCODE,ADM0_EN=COUNTRY)%>%
  dplyr::select(ADM1_PCODE,ADM2_PCODE,ADM0_EN)

# create a data frame with admin boundaries 

Admin_all<-rbind(Ethiopia,kenya,SA_admin2_region,Mozambique_lhz,Lesotho_lhz,Ethiopia_lhz,kenya_lhz)

All_df<-read.csv("./data/all_indicators.csv")%>%
  dplyr::mutate(date=ymd(date1))

admin <- list(Ethiopia, kenya)


 
Admin_all1<-Admin_all
st_geometry(Admin_all1)<-NULL 

vci_df<-read.csv("./data/vci.csv")%>%
  dplyr::mutate(date=ymd(date))%>%
  dplyr::mutate(ADM2_PCODE=factor(pcode))%>%
  dplyr::select(ADM2_PCODE,date,vci)%>%
  left_join(Admin_all1,by='ADM2_PCODE')#%>%filter(ADM0_EN %in% c('KENYA','ETHIOPIA'))
#group_by(ADM1_PCODE,date)%>%  dplyr::summarise(vci=mean(vci),ADM0_EN=first(ADM0_EN))%>%ungroup()%>%filter(ADM0_EN %in% c('Mozambique','Namibia','Lesotho'))

rain_df_daily<-read.csv("./data/Daily_rainfall.csv")%>%
  dplyr::mutate(date=ymd(date))%>%
  dplyr::mutate(ADM2_PCODE=factor(pcode))%>%
  dplyr::select(ADM2_PCODE,date,rain)%>%
  left_join(Admin_all1,by='ADM2_PCODE')#%>%  filter(ADM0_EN %in% c('KENYA','ETHIOPIA'))
#group_by(ADM1_PCODE,date)%>%  dplyr::summarise(rain=mean(rain),ADM0_EN=first(ADM0_EN))%>%ungroup()%>%filter(ADM0_EN %in% c('Mozambique','Namibia','Lesotho'))


ipc_KE<-read.csv("./data/ipc_admin_KE.csv")%>%mutate(date=ymd(as.Date(Date)))
ipc_eth<-read.csv("./data/ipc_admin_ETH.csv")%>%mutate(date=ymd(as.Date(Date)))
ipc_lhz_ETH<-read.csv("./data/ipc_lhz_ETH.csv") %>%rename(ADM2_PCODE='LZCODE')%>%mutate(date=ymd(as.Date(Date)))
ipc_lhz_KE<-read.csv("./data/ipc_lhz_KE.csv") %>%rename(ADM2_PCODE='LZCODE')%>%mutate(date=ymd(as.Date(Date)))
ipc_data<-rbind(ipc_KE,ipc_eth,ipc_lhz_ETH,ipc_lhz_KE) 


all_days <- tibble(date = seq(min(ipc_data$date),max(ipc_data$date) , by="months"))

ipc_filled <- as.data.frame(merge(all_days, tibble(ADM2_PCODE = unique(ipc_data$ADM2_PCODE))))%>%
  dplyr::mutate(ADM2_PCODE=factor(ADM2_PCODE),month=format(date, '%b'),Year=year(date))%>%
  left_join(ipc_data,by=c('ADM2_PCODE','date'))%>%
  dplyr::group_by(ADM2_PCODE)%>%arrange(date)%>%
  fill(CS, .direction = "downup")%>%
  dplyr::ungroup()%>%left_join(Admin_all1,by='ADM2_PCODE')


ENSO1<-read.csv("./data/ENSO.csv") %>% gather("MON",'ENSO',-Year)%>% 
  arrange(Year) %>%
  dplyr::mutate(date=seq(as.Date("1950/01/01"), by = "month", length.out = 852))%>%
  filter(date>= as.Date("1980/01/01"))

#Dipole Mode Index (DMI)

IOD<-read.csv("./data/IOD_DMI_standard.csv") %>%
  gather("MON",'IOD',-year) %>% arrange(year)%>%
  dplyr::mutate(date=seq(as.Date("1870/01/01"), by = "month", length.out = 1812),IOD=as.numeric(IOD))%>%
  filter(date >= as.Date("1980/01/01"))


SST_var<-ENSO1%>%
  dplyr::select(date,ENSO)%>%
  left_join(IOD%>% dplyr::select(date,IOD),by='date')

all_days <- tibble(date = seq(min(vci_df$date),max(vci_df$date) , by="months"))

dmp_filled <- merge(all_days, tibble(ADM2_PCODE = unique(vci_df$ADM2_PCODE)))

dmp_filled<-as.data.frame(dmp_filled) %>% dplyr::mutate(ADM2_PCODE=factor(ADM2_PCODE))

dmp_filled2 <- dmp_filled %>%
  left_join(vci_df%>% dplyr::mutate(ADM2_PCODE=factor(ADM2_PCODE)), by = c("ADM2_PCODE", "date"))



All_df_filled <- dmp_filled2 %>%select(ADM2_PCODE,date,vci)%>%
  select(ADM2_PCODE,date,vci)%>%left_join(Admin_all1,by='ADM2_PCODE')%>%
  left_join(SST_var,by='date')%>%
  dplyr::group_by(ADM2_PCODE) %>%arrange(date)%>%fill(vci, .direction = "downup")%>%
  dplyr::ungroup()

# All_df_filled_admin1 <- dmp_filled2%>%dplyr::select(ADM2_PCODE,date,vci)%>%
#   left_join(rain_df, by = c("ADM2_PCODE", "date"))%>%
#   dplyr::select(ADM2_PCODE,date,vci,rain_mon)%>%left_join(Admin_all1,by='ADM2_PCODE')%>%
#   group_by(ADM1_PCODE,date)%>%
#   dplyr::summarise(rain_mon=mean(rain_mon), 
#                    ADM0_EN=first(ADM0_EN),
#                    vci=mean(vci))%>%
#   ungroup()%>%left_join(SST_var,by='date')%>% 
#   dplyr::group_by(ADM1_PCODE) %>%fill(vci, .direction = "downup")%>%
#   dplyr::ungroup()



 
Emdat_impact_sff<-sf::read_sf("./data/Emdat_impact.shp")%>% 
  dplyr::mutate(total_affected=TtlAffc,no_affected=NAffctd)




Kenya_impact<-st_join(Emdat_impact_sff %>%  filter(Country=='Kenya'), kenya) %>% st_set_geometry(NULL)
Ethiopia_impact<-st_join(Emdat_impact_sff %>%  filter(Country=='Ethiopia') , Ethiopia) %>% st_set_geometry(NULL)


for (n in range(1,length(admin))){
  admin[[n]] <- st_transform(admin[[n]], crs = "+proj=longlat +datum=WGS84")
}


# Clean impact and keep relevant columns
df_impact_raw <- list()

df_impact_raw[[1]] <- Ethiopia_impact %>%
  clean_names() %>% dplyr::mutate(date = dmy(date),pcode = adm2_pcode) %>% 
  dplyr::select(pcode, date,total_affected,no_affected) %>%
  unique() %>%  arrange(pcode, date)

df_impact_raw[[2]] <- Kenya_impact %>%
  clean_names() %>% dplyr::mutate(date = dmy(date),pcode = adm2_pcode) %>% 
  dplyr::select(pcode, date,total_affected,no_affected) %>%
  unique() %>%  arrange(pcode, date)

df_impact_raw[[3]] <- NA

df_impact_raw[[10]] <- df_impact_raw[[1]] 
df_impact_raw[[20]] <- df_impact_raw[[2]] 
df_impact_raw[[30]] <- NA



# Used to join against
all_days <- tibble(date = seq(min(c(df_impact_raw[[1]]$date, df_impact_raw[[2]]$date), na.rm=T) - 60,
                              max(c(df_impact_raw[[1]]$date, df_impact_raw[[2]]$date), na.rm=T) + 60, by="months"))



summarize_events <- function(df) {
  df %>% group_by(pcode) %>%  dplyr::summarise(n_events = dplyr::n()) %>% arrange(n_events) %>% ungroup()
}


#summarize_events(df_impact_raw[[1]]) %>% dplyr::select(pcode, n_events)



admin[[1]] <- admin[[1]] %>%
  left_join(summarize_events(df_impact_raw[[1]]) %>%
              dplyr::select(pcode, n_events),   by = c("ADM2_PCODE" = "pcode")) %>%   dplyr::filter(!is.na(n_events))

admin[[2]] <- admin[[2]] %>%
  left_join(summarize_events(df_impact_raw[[2]]) %>%
              dplyr::select(pcode, n_events), by = c("ADM2_PCODE" = "pcode")) %>% dplyr::filter(!is.na(n_events))

admin[[3]] <- NA

#change wih livelyhodzone
admin[[10]] <- admin[[1]]
admin[[20]] <- admin[[2]]
admin[[30]] <- admin[[3]]



df_indicators <- list()

df_indicators[[1]] <- All_df_filled %>% dplyr::filter( ADM0_EN %in% c("Ethiopia","ETHIOPIA"))
df_indicators[[2]] <- All_df_filled %>% dplyr::filter( ADM0_EN %in% c("KENYA","Kenya"))
df_indicators[[3]] <- NA

df_indicators[[10]] <-All_df_filled %>% dplyr::filter( ADM0_EN %in% c("ET"))
df_indicators[[20]] <-All_df_filled %>% dplyr::filter( ADM0_EN %in% c("KE"))
df_indicators[[30]] <-df_indicators[[3]] 

label <- list()
label[[1]] <- "ADM2_PCODE"
label[[2]] <- "ADM2_PCODE"
label[[3]] <- "ADM2_PCODE"
label[[10]] <- "ADM2_PCODE"
label[[20]] <- "ADM2_PCODE"
label[[30]] <- "ADM2_PCODE"

layerId <- list()
layerId[[1]] <- "ADM2_PCODE"
layerId[[2]] <- "ADM2_PCODE"
layerId[[3]] <- "ADM2_PCODE"
layerId[[10]] <- "ADM2_PCODE"
layerId[[20]] <- "ADM2_PCODE"
layerId[[30]] <- "ADM2_PCODE"