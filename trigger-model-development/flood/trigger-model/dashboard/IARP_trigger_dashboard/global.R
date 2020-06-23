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

source('r_resources/plot_functions.R')
source('r_resources/predict_functions.R')
source('r_resources/Geo_settings.R')
source('r_resources/misc_functions.R')

#---------------------- setting -------------------------------

settings <- country_settings
url<- parse_url(url_geonode)

# country="ethiopia"
# for (elm in  names(eval(parse(text=paste("settings$",country,sep=""))))){
#   assign(paste0(country,"_",elm), download.features.geonode(country, elm))
# }
#
#
# country="kenya"
# for (elm in  names(eval(parse(text=paste("settings$",country,sep=""))))){
#   assign(paste0(country,"_",elm), download.features.geonode(country, elm))
# }
#
# country="uganda"
# for (elm in  names(eval(parse(text=paste("settings$",country,sep=""))))){
#   assign(paste0(country,"_",elm), download.features.geonode(country, elm))
# }

ethiopia_admin3 <- sf::read_sf("shapes/eth_adminboundaries_3.shp")
kenya_admin1 <- sf::read_sf("shapes/ken_adminboundaries_2.shp")
uganda_admin2 <- sf::read_sf("shapes/uga_adminboundaries_1.shp")

kenya_admin1<-kenya_admin1 %>% dplyr::mutate(ADM2_PCODE=ADM1_PCODE,ADM2_EN=ADM1_EN)



admin <- list(ethiopia_admin3, kenya_admin1, uganda_admin2)
# swi <- read.csv("data/ethiopia_admin3_swi_all.csv", stringsAsFactors = F, colClasses = c("character", "character", "numeric", "numeric", "numeric"))
#ethiopia_impact <- read.csv("data/Eth_impact_data2.csv", stringsAsFactors = F, sep=";")

ethiopia_impact <- read_delim("data/Ethiopia_impact.csv", ",", escape_double = FALSE, trim_ws = TRUE)
#uganda_impact <- read_delim("data/uga_impactdata_master.csv", ",", escape_double = FALSE, trim_ws = TRUE)
uganda_impact <- read_delim("data/uga_impactdata_v2.csv", ",", escape_double = FALSE, trim_ws = TRUE)
uganda_impact <- uganda_impact %>% filter(data_quality_score > 0)
uganda_extra_impact <- read_delim("data/uga_impactdata_dref_appeal.csv", ",", escape_double = FALSE, trim_ws = TRUE)
kenya_impact <- read_delim("data/ken_impactdata_master.csv", ";", escape_double = FALSE, trim_ws = TRUE)

# to be replaced by data imorted from Geonode
#eth_admin3 <- sf::read_sf("shapes/ETH_Admin3_2019.shp")





for (n in range(1,length(admin))){
  admin[[n]] <- st_transform(admin[[n]], crs = "+proj=longlat +datum=WGS84")
}

glofas_raw <- read_csv("data/GLOFAS_fill_allstation_.csv") %>% rename(date = time)

glofas_mapping <- list()

glofas_mapping[[1]] <- read.csv("data/Eth_affected_area_stations2.csv", stringsAsFactors = F)
glofas_mapping[[2]] <- read.csv("data/kenya_affected_area_stations.csv", stringsAsFactors = F)
glofas_mapping[[3]] <- read.csv("data/uga_affected_area_stations.csv", stringsAsFactors = F)
rainfall_raw <- list()
rainfall_raw[[1]] <- read_csv('data/Impact_Hazard_catalog.csv') %>% clean_names()
rainfall_raw[[2]] <- read_csv('data/WRF_kenya_2000-2010.csv') %>% clean_names()
rainfall_raw[[3]] <- read_csv('data/WRF_uganda_2000-2010.csv') %>% clean_names()

rp_glofas_station <- read_csv('data/rp_glofas_station.csv') %>% clean_names()


# Clean impact and keep relevant columns
df_impact_raw <- list()
df_impact_raw[[1]] <- ethiopia_impact %>%
  clean_names() %>%
  mutate(date = dmy(date),
         pcode = str_pad(as.character(pcode), 6, "left", "0"),
         admin = wereda) %>%
  dplyr::select(admin, zone, pcode, date) %>%
  unique() %>%
  arrange(pcode, date)
df_impact_raw[[2]] <-kenya_impact %>%
  clean_names() %>%
  mutate(date = ymd(date_recorded),
         pcode = adm2_pcode,
         admin = adm2_name) %>%
  dplyr::select(admin, pcode, date) %>%
  unique() %>%
  arrange(pcode, date)


df_impact_raw[[3]] <- uganda_impact %>%
  clean_names() %>%
  mutate(date = dmy(date_event),
         pcode = adm2_pcode,
         admin = adm2_name) %>%
  dplyr::select(admin, pcode, date) %>%
  unique() %>%
  arrange(pcode, date)

df_extra_impact <- list()
df_extra_impact[[1]] <- NA
df_extra_impact[[2]] <- NA
df_extra_impact[[3]] <- uganda_extra_impact %>%
  clean_names() %>%
  mutate(date = dmy(date_event),
         pcode = adm2_pcode,
         admin = adm2_name) %>%
  dplyr::select(admin, pcode, date) %>%
  unique() %>%
  arrange(pcode, date)
df_extra_impact[[1]] <- df_extra_impact[[3]] # dummy data
df_extra_impact[[2]] <- df_extra_impact[[3]] # dummy data

# Used to join against
all_days <- tibble(date = seq(min(c(df_impact_raw[[1]]$date, df_impact_raw[[2]]$date, df_impact_raw[[3]]$date), na.rm=T) - 60,
                              max(c(df_impact_raw[[1]]$date, df_impact_raw[[2]]$date, df_impact_raw[[3]]$date), na.rm=T) + 60, by="days"))

# Clean GLOFAS mapping
glofas_mapping[[1]] <- glofas_mapping[[1]] %>%
  dplyr::select(-Z_NAME) %>%
  gather(station_i, station_name, -W_NAME) %>%
  dplyr::filter(!is.na(station_name)) %>%
  dplyr::mutate(admin = W_NAME) %>%
  dplyr::select(admin, station_name) %>%
  left_join(df_impact_raw[[1]] %>% dplyr::select(admin, pcode) %>% unique(), by = c("admin" = "admin")) %>%
  mutate(pcode = str_pad(as.character(pcode), 6, "left", "0")) %>%
  dplyr::filter(!is.na(pcode))

glofas_mapping[[2]] <- glofas_mapping[[2]] %>%
  left_join(kenya_impact  %>% dplyr::select(County, adm2_pcode) %>%  unique(), by = "County") %>%
  dplyr::mutate(admin = County,station_name=station,pcode=adm2_pcode) %>%
  dplyr::select(admin, station_name, pcode)

glofas_mapping[[3]] <- glofas_mapping[[3]] %>%
  dplyr::select(name, pcode, Glofas_st, Glofas_st2, Glofas_st3, Glofas_st4) %>%
  gather(station_i, station_name, -name, -pcode) %>%
  dplyr::filter(!is.na(station_name) & station_name != "") %>%
  dplyr::mutate(admin = name) %>%
  dplyr::select(admin, station_name, pcode)

# Clean glofas
glofas_raw <- glofas_raw %>%
  dplyr::filter(
    date >= min(all_days$date),
    date <= max(all_days$date))

glofas_raw <- expand.grid(all_days$date, unique(glofas_raw$station)) %>%
  rename(date = Var1, station = Var2) %>%
  left_join(glofas_raw %>% dplyr::select(date, dis, dis_3, dis_7, station), by = c("date", "station")) %>% arrange(station, date) %>%
  arrange(station, date) %>%
  group_by(station) %>%
  fill(dis, dis_3, dis_7, .direction="down") %>%
  fill(dis, dis_3, dis_7, .direction="up") %>%
  ungroup()

rainfall_raw[[1]] <- rainfall_raw[[1]] %>%
  left_join(df_impact_raw[[1]] %>% dplyr::select(pcode, zone), by = "zone") %>%
  group_by(pcode, date) %>%
  summarise(rainfall = mean(rainfall, na.rm=T))
rainfall_raw[[3]] <- rainfall_raw[[3]] %>% mutate(date = dmy(time)) %>% dplyr::select(-time) %>%
  gather(name, rainfall, -date) %>%
  left_join(df_impact_raw[[3]] %>% mutate(name = tolower(admin)) %>% dplyr::select(name, pcode), by = "name")
rainfall_raw[[2]] <- rainfall_raw[[2]] %>% mutate(date = dmy(time)) %>% dplyr::select(-time) %>%
  gather(name, rainfall, -date) %>%
  left_join(df_impact_raw[[2]] %>% mutate(name = tolower(admin)) %>% dplyr::select(name, pcode), by = "name")

# Clean rainfall - CHIRPS, kept for legacy
# rainfall_raw <- rainfall_raw %>%
#   mutate(pcode = str_pad(pcode, 6, "left", 0)) %>%
#   filter(
#     date >= min(df_impact_raw$date, na.rm=T) - 60,
#     date <= max(df_impact_raw$date, na.rm=T) + 60)

# # SWI, kept for legacy
# swi_raw <- swi %>%
#   mutate(date = ymd(date))
#
# swi_raw <- swi_raw %>%
#   gather(depth, swi, -pcode, -date)

# Determine floods per Wereda for map

admin[[1]] <- admin[[1]] %>%
  left_join(summarize_floods(df_impact_raw[[1]]) %>%
              dplyr::select(pcode, n_floods), by = c("ADM3_PCODE" = "pcode")) %>%
  dplyr::filter(!is.na(n_floods))

admin[[2]] <- admin[[2]] %>%
  left_join(summarize_floods(df_impact_raw[[2]]) %>%
              dplyr::select(pcode, n_floods), by = c("ADM2_PCODE" = "pcode")) %>%
  dplyr::filter(!is.na(n_floods))

admin[[3]] <- admin[[3]] %>%
  left_join(summarize_floods(df_impact_raw[[3]]) %>%
              dplyr::select(pcode, n_floods), by = c("ADM2_PCODE" = "pcode")) %>%
  dplyr::filter(!is.na(n_floods))

label <- list()
label[[1]] <- "ADM3_EN"
label[[2]] <- "ADM2_EN"
label[[3]] <- "ADM2_EN"
layerId <- list()
layerId[[1]] <- "ADM3_PCODE"
layerId[[2]] <- "ADM2_PCODE"
layerId[[3]] <- "ADM2_PCODE"
