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

#---------------------- setting -------------------------------

settings <- country_settings
url<- parse_url(url_geonode)



Country="kenya"
# for (elm in  names(eval(parse(text=paste("settings$",Country,sep=""))))){
#   url$query <- list(service = "WFS",version = "2.0.0",request = "GetFeature",
#                     typename = eval(parse(text=paste("settings$",Country,"$",elm,sep=""))),
#                     outputFormat = "application/json")
#   request <- build_url(url)
#   data_read <- st_read(request)
#   assign(paste0(Country,"_",elm),data_read)
# }



# to be replaced by data imorted from Geonode 
kenya_admin1 <- sf::read_sf("shapes/ken_adminboundaries_1.shp") 
kenya_admin1 <- st_transform(kenya_admin1, crs = "+proj=longlat +datum=WGS84")

glofas_raw <- read_csv("data/GLOFAS_fill_allstation_.csv") %>% rename(date = time)
glofas_mapping <- read.csv("data/kenya_affected_area_stations.csv",sep=";" ,stringsAsFactors = F) %>% clean_names()

 

rp_glofas_station <- read_csv('data/rp_glofas_station.csv') %>% clean_names()


# Clean impact and keep relevant columns
# Clean impact and keep relevant columns

Kenya_impact <- read.csv("data/Kenya_impact.csv",sep=";")

df_impact_raw <-   mutate(date = ymd(date_recorded), pcode = str_pad(as.character(adm1_pcode), 5, "left", "0")) %>%
  dplyr::select(pcode,county, sub_county, ward, date) %>%
  unique() %>%
  arrange(date)
 
# Used to join against
all_days <- tibble(date = seq(min(df_impact_raw$date, na.rm=T) - 60, max(df_impact_raw$date, na.rm=T) + 60, by="days"))

# Clean GLOFAS mapping
glofas_mapping <- glofas_mapping %>%
  left_join(df_impact_raw %>% dplyr::select(county, pcode) %>% 
  unique(), by = "county") %>%
  dplyr::filter(!is.na(pcode))



# Clean glofas
glofas_raw <- glofas_raw %>%
  dplyr::filter(
    date >= min(df_impact_raw$date, na.rm=T) - 60,
    date <= max(df_impact_raw$date, na.rm=T) + 60)

glofas_raw <- expand.grid(all_days$date, unique(glofas_raw$station)) %>%
  rename(date = Var1, station = Var2) %>%
  left_join(glofas_raw %>% dplyr::select(date, dis, dis_3, dis_7, station), by = c("date", "station")) %>% arrange(station, date) %>%
  arrange(station, date) %>%
  group_by(station) %>%
  fill(dis, dis_3, dis_7, .direction="down") %>%
  fill(dis, dis_3, dis_7, .direction="up") %>%
  ungroup()

 

# Clean rainfall - CHIRPS, kept for legacy
# rainfall_raw <- rainfall_raw %>%
#   mutate(pcode = str_pad(pcode, 6, "left", 0)) %>%
#   filter(
#     date >= min(df_impact_raw$date, na.rm=T) - 60,
#     date <= max(df_impact_raw$date, na.rm=T) + 60)

# # SWI, kept for legacy
# swi_raw <- swi %>%
#   mutate(date = ymd(date))
# swi_raw <- swi_raw %>%
#   gather(depth, swi, -pcode, -date)

# Determine floods per Wereda for map
floods_per_wereda <- df_impact_raw %>%
  group_by(county, pcode) %>%
  summarise(
    n_floods = n()
  ) %>%
  arrange(-n_floods) %>%
  ungroup()

kenya_admin1 <- kenya_admin1 %>%
  left_join(floods_per_wereda %>% dplyr::select(pcode, n_floods), by = c("ADM1_PCODE" = "pcode"))%>%
  dplyr::filter(!is.na(n_floods)) %>% rename("county"="ADM1_EN","pcode"="ADM1_PCODE")

flood_palette <- colorNumeric(palette = "YlOrRd", domain = floods_per_wereda$n_floods)