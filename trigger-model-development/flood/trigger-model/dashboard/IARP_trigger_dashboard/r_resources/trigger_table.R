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

setwd(dirname(rstudioapi::getSourceEditorContext()$path))
setwd('../')
#---------------------- setting -------------------------------
source('r_resources/plot_functions.R')
source('r_resources/predict_functions.R')
source('r_resources/Geo_settings.R')
source('r_resources/misc_functions.R')

ethiopia_admin3 <- sf::read_sf("shapes/eth_adminboundaries_3.shp")
uganda_admin2 <- sf::read_sf("shapes/uga_adminboundaries_1.shp")
#kenya_admin1<-sf::read_sf("shapes/ken_adminboundaries_2.shp") %>% dplyr::mutate(ADM2_PCODE=ADM1_PCODE,ADM2_EN=ADM1_EN)

kenya_admin1 <- sf::read_sf("shapes/ken_adminboundaries_3.shp") %>% 
  dplyr::mutate(ADM3_PCODE=ADM2_PCODE,ADM3_EN=ADM2_EN) %>% dplyr::select(ADM3_PCODE,ADM3_EN)

admin <- list(ethiopia_admin3, kenya_admin1, uganda_admin2)

ethiopia_impact <- read_delim("data/eth_impactdata_master_.csv", ";", escape_double = FALSE, trim_ws = TRUE)%>%
  dplyr::mutate(score=ifelse(is.na(Data_quality_score),99,Data_quality_score))%>%
  dplyr::filter(score != 0)

uganda_impact <- read_delim("data/uga_impactdata_v2.csv", ",", escape_double = FALSE, trim_ws = TRUE)
uganda_impact <- uganda_impact %>% filter(data_quality_score > 0)
uganda_extra_impact <- read_delim("data/uga_impactdata_dref_appeal.csv", ",", escape_double = FALSE, trim_ws = TRUE)

kenya_impact <- read_delim("data/ken_impactdata_master_.csv", ";", escape_double = FALSE, trim_ws = TRUE)%>%
  filter(	ADM3_PCODE != '#N-A') %>% dplyr::select(-adm2_name)

# Clean impact and keep relevant columns

df_impact_raw <- list()

df_impact_raw[[1]] <- ethiopia_impact %>%
  clean_names() %>% mutate(date = dmy(date),pcode = str_pad(as.character(adm3_pcode), 6, "left", "0"),
                           zone = adm2_name,admin = adm3_name) %>%
  dplyr::select(admin, zone, pcode,ifrc_source, date) %>%  unique() %>% arrange(pcode, date)

ethiopia_extra_impact <- df_impact_raw[[1]] %>% dplyr::filter(ifrc_source == 'IFRC')


df_impact_raw[[2]] <-kenya_impact %>%
  clean_names() %>%
  mutate(date = dmy(date_recorded),
         pcode = adm3_pcode,
         admin = adm3_name) %>%
  dplyr::select(admin, pcode,data_source, date) %>%
  unique() %>%
  arrange(pcode, date)


kenya_extra_impact <- df_impact_raw[[2]] %>% dplyr::filter(data_source == 'dref')

df_impact_raw[[3]] <- uganda_impact %>%
  clean_names() %>%
  mutate(date = dmy(date_event),pcode = adm2_pcode,admin = adm2_name) %>%
  dplyr::select(admin, pcode, date) %>%unique() %>%arrange(pcode, date)


df_extra_impact <- list()

df_extra_impact[[1]] <- ethiopia_extra_impact %>%
  dplyr::select(admin, pcode, date) %>%
  unique() %>%
  arrange(pcode, date)

df_extra_impact[[2]] <- kenya_extra_impact %>%
  dplyr::select(admin, pcode, date) %>%
  unique() %>%arrange(pcode, date)

df_extra_impact[[3]] <- uganda_extra_impact %>%
  clean_names() %>%
  mutate(date = dmy(date_event),pcode = adm2_pcode,admin = adm2_name) %>% 
  dplyr::select(admin, pcode, date) %>%
  unique() %>%  arrange(pcode, date)


################################ TRIGGER TABLE ETHIOPIA ##################


glofas_impact <- read.csv("data/Eth_affected_area_stations2.csv", stringsAsFactors = F) %>%
  dplyr::select(-Z_NAME) %>%
  gather(station_i, station_name, -W_NAME) %>%
  dplyr::filter(!is.na(station_name)) %>%
  dplyr::mutate(admin = W_NAME) %>%
  dplyr::select(admin, station_name) %>%
  left_join(df_impact_raw[[1]] %>% dplyr::mutate(flood = TRUE) %>% dplyr::select(-zone) , by = c("admin" = "admin")) %>%  #%>% unique()
  mutate(pcode = str_pad(as.character(pcode), 6, "left", "0")) %>%
  dplyr::filter(!is.na(pcode))

glofas_date_window=21 

glofas_raw <- read_csv("data/GLOFAS_fill_allstation_.csv") %>% rename(date = time) %>%
  group_by(station) %>%
  mutate(dis_d = rollapplyr(data = dis, width = glofas_date_window,FUN=max,align="center",fill = NA,na.rm = TRUE),
         q5=quantile(dis,probs=.05, names = FALSE), 
         q10=quantile(dis,probs=.1, names = FALSE),
         q20=quantile(dis,probs=.2, names = FALSE), 
         q50=quantile(dis,probs=.5, names = FALSE), 
         q75=quantile(dis,probs=.75, names = FALSE), 
         q85=quantile(dis,probs=.85, names = FALSE), 
         q80=quantile(dis,probs=.80, names = FALSE), 
         q95=quantile(dis,probs=.95, names = FALSE), 
         dis_3d = rollapplyr(data = dis_3, width = glofas_date_window,FUN=max,align="center",fill = NA,na.rm = TRUE),
         dis_7d = rollapplyr(data = dis_7, width = glofas_date_window,FUN=max,align="center",fill = NA,na.rm = TRUE))%>%  ungroup()


glofas_raw_ <- glofas_raw %>%dplyr::filter(
  date >= min(glofas_impact$date)-15,
  date <= max(glofas_impact$date)+15) %>% filter(!is.na(dis_d))

day_range<-40
thresholds<-c('q5','q10','q20','q50','q75','q80','q95')


for (districts in glofas_impact$pcode %>% unique())
{  df1<- glofas_impact %>% filter(pcode==districts)

for (stations in df1$station_name %>%  unique())
{
  df2<-glofas_raw_ %>% filter(station==stations)%>% left_join(df1 , by = "date") %>% distinct(date,.keep_all = TRUE)%>% 
    filter(!is.na(dis_d))%>%
    dplyr::filter(date >= min(df1$date)-21,
      date <= max(df1$date)+21) #!='NA') drop_na() filter( min(df1$date)
  
  for (elm in thresholds){
  #  print(elm)
  thr<- unique(eval(parse(text=paste0("df2$",elm)))) # unique(df2$q85)#
  df3<-df2 %>% mutate(
    flood = replace_na(flood, FALSE),
    exceeds_threshold = dis_3d >= thr,
    next_exceeds_threshold = lead(exceeds_threshold),
    prev_exceeds_threshold = dplyr::lag(exceeds_threshold),
    either_peak_start =  exceeds_threshold & !prev_exceeds_threshold,
    either_peak_end = exceeds_threshold & !next_exceeds_threshold,
    either_peak_start_range = lead(either_peak_start, 0),  # There is an option here to also count days before the trigger but currently we don't use it
    either_peak_end_range = dplyr::lag(either_peak_end, day_range),  # Count events day_range amount of days after the trigger as the same peak
    either_peak_end_range = replace_na(either_peak_end_range, FALSE),
    either_in_peak_range = cumsum(either_peak_start_range) > cumsum(either_peak_end_range), # Combine peaks within the same range into a single peak
    flood_in_which_peak = cumsum(either_peak_start_range) * flood * either_in_peak_range,
    protocol_triggered = either_in_peak_range & !dplyr::lag(either_in_peak_range),  # Counts number of times protocol is triggered
    flood_correct = flood & either_in_peak_range
  ) %>%
    summarise(
      floods = sum(flood),
      floods_correct = sum(flood_correct),
      floods_incorrect = floods - floods_correct,
      protocol_triggered = sum(protocol_triggered, na.rm=T),
      triggered_in_vain = protocol_triggered - (length(unique(flood_in_which_peak)) - 1),
      detection_ratio = round(floods_correct / floods, 2),
      false_alarm_ratio = round(triggered_in_vain/protocol_triggered, 2)
    )%>% filter(detection_ratio> 0)
  
  df4<-data.frame(df3) %>% mutate(thr=thr,thr_stat=elm,district=districts,Glofas_st=stations) %>%
    select(district,Glofas_st,thr_stat,thr,floods,floods_correct,floods_incorrect,protocol_triggered,triggered_in_vain,detection_ratio,false_alarm_ratio)
   if(nrow(df4)>0){
    
  print(df4)
  write.table(df4, "output/Ethiopi_trigger_table_3days_leadtime.csv", sep = "\t", col.names = !file.exists("output/Ethiopi_trigger_table_3days_leadtime.csv"), append = T)
  
  }}
  
  ########## 7 day lead time 
  
  for (elm in thresholds){
    #  print(elm)
    thr<- unique(eval(parse(text=paste0("df2$",elm)))) # unique(df2$q85)#
    df3<-df2 %>% mutate(
      flood = replace_na(flood, FALSE),
      exceeds_threshold = dis_7d >= thr,
      next_exceeds_threshold = lead(exceeds_threshold),
      prev_exceeds_threshold = dplyr::lag(exceeds_threshold),
      either_peak_start =  exceeds_threshold & !prev_exceeds_threshold,
      either_peak_end = exceeds_threshold & !next_exceeds_threshold,
      either_peak_start_range = lead(either_peak_start, 0),  # There is an option here to also count days before the trigger but currently we don't use it
      either_peak_end_range = dplyr::lag(either_peak_end, day_range),  # Count events day_range amount of days after the trigger as the same peak
      either_peak_end_range = replace_na(either_peak_end_range, FALSE),
      either_in_peak_range = cumsum(either_peak_start_range) > cumsum(either_peak_end_range), # Combine peaks within the same range into a single peak
      flood_in_which_peak = cumsum(either_peak_start_range) * flood * either_in_peak_range,
      protocol_triggered = either_in_peak_range & !dplyr::lag(either_in_peak_range),  # Counts number of times protocol is triggered
      flood_correct = flood & either_in_peak_range
    ) %>%
      summarise(
        floods = sum(flood),
        floods_correct = sum(flood_correct),
        floods_incorrect = floods - floods_correct,
        protocol_triggered = sum(protocol_triggered, na.rm=T),
        triggered_in_vain = protocol_triggered - (length(unique(flood_in_which_peak)) - 1),
        detection_ratio = round(floods_correct / floods, 2),
        false_alarm_ratio = round(triggered_in_vain/protocol_triggered, 2)
      )%>% filter(detection_ratio> 0)
    
    df4<-data.frame(df3) %>% mutate(thr=thr,thr_stat=elm,district=districts,Glofas_st=stations) %>%
      select(district,Glofas_st,thr_stat,thr,floods,floods_correct,floods_incorrect,protocol_triggered,triggered_in_vain,detection_ratio,false_alarm_ratio)
    
    if(nrow(df4)>0){
      
      print(df4)
      write.table(df4, "output/Ethiopi_trigger_table_7days_leadtime.csv", sep = "\t", col.names = !file.exists("output/Ethiopi_trigger_table_3days_leadtime.csv"), append = T)
      
    }}}}

glofas_mapping <- list()

glofas_mapping[[1]] <- read.csv("data/Eth_affected_area_stations2.csv", stringsAsFactors = F)


########## per sub county 
kenya_mapp<- read.csv("data/kenya_affected_area_stations.csv", stringsAsFactors = F) %>% mutate(ADM2_EN=County)

glofas_mapping[[2]] <-  read.csv("data/ken_adm3.csv", stringsAsFactors = F) %>% 
  left_join(kenya_mapp,by='ADM2_EN')  %>% dplyr::select(ADM3_EN,ADM3_PCODE,station)  %>% drop_na()

glofas_mapping[[3]] <- read.csv("data/uga_affected_area_stations.csv", stringsAsFactors = F)

rp_glofas_station <- read_csv('data/rp_glofas_station.csv') %>% clean_names()



# Used to join against
all_days <- tibble(date = seq(min(c(df_impact_raw[[1]]$date, df_impact_raw[[2]]$date, df_impact_raw[[3]]$date), na.rm=T) - 60,
                              max(c(df_impact_raw[[1]]$date, df_impact_raw[[2]]$date, df_impact_raw[[3]]$date), na.rm=T) + 60, by="days"))


#per sub county 
glofas_mapping[[2]] <- glofas_mapping[[2]] %>% 
  left_join(kenya_impact  %>% dplyr::select(adm3_name, ADM3_PCODE) %>%  unique(), by = "ADM3_PCODE") %>%
  dplyr::mutate(admin = adm3_name,station_name=station,pcode=ADM3_PCODE) %>%
  dplyr::select(admin, station_name, pcode)


glofas_mapping[[3]] <- glofas_mapping[[3]] %>%
  dplyr::select(name, pcode, Glofas_st, Glofas_st2, Glofas_st3, Glofas_st4) %>%
  gather(station_i, station_name, -name, -pcode) %>%
  dplyr::filter(!is.na(station_name) & station_name != "") %>%
  dplyr::mutate(admin = name) %>%
  dplyr::select(admin, station_name, pcode)








