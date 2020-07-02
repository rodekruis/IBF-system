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

setwd('C:/Users/ATeklesadik/OneDrive - Rode Kruis/Documents/documents/IBF-system/trigger-model-development/flood/trigger-model/dashboard')

source('IARP_trigger_dashboard/r_resources/plot_functions.R')
source('IARP_trigger_dashboard/r_resources/predict_functions.R')
source('IARP_trigger_dashboard/r_resources/Geo_settings.R')
source('IARP_trigger_dashboard/r_resources/misc_functions.R')

kenya_impact <- read_delim("IARP_trigger_dashboard/data/ken_impactdata_master_1.csv", ";", escape_double = FALSE, trim_ws = TRUE)%>% clean_names() %>%mutate(admin=adm3_name,pcode=adm3_pcode)

# Clean impact and keep relevant columns
df_impact_raw <- list()


countries <- c("Ethiopia", "Kenya" ,"Uganda")
levels <- c("LEVEL 2", "LEVEL 3")


df_impact_raw[[1]] <-kenya_impact %>%
  clean_names() %>%
  mutate(date = dmy(date_recorded),
         pcode = adm3_pcode,
         admin = adm3_name) %>%
  dplyr::select(admin, pcode,data_source, date) %>%
  unique() %>%
  arrange(pcode, date)

df_impact_raw[[2]] <-kenya_impact %>%
  clean_names() %>%
  mutate(date = dmy(date_recorded),
         pcode = adm3_pcode,
         admin = adm3_name) %>%
  dplyr::select(admin, pcode,data_source, date) %>%
  unique() %>%
  arrange(pcode, date)


# Determine floods per Wereda for map
kenya_admin1 <- sf::read_sf("IARP_trigger_dashboard/shapes/ken_adminboundaries_4.shp") %>% dplyr::mutate(ADM3_EN=WARDS,admin=WARDS) %>% 
  dplyr::select(ADM3_PCODE,ADM3_EN,admin) %>% clean_names()

admin <- list(kenya_admin1, kenya_admin1)

admin[[1]] <- admin[[1]] %>%left_join(summarize_floods(kenya_impact) %>%dplyr::select(pcode, n_floods), by = c("adm3_pcode" = "pcode")) %>%
  dplyr::filter(!is.na(n_floods))

admin[[2]] <- admin[[2]] %>%
  left_join(summarize_floods(kenya_impact) %>%dplyr::select(pcode, n_floods), by = c("adm3_pcode" = "pcode")) %>% dplyr::filter(!is.na(n_floods))

 

label <- list()
label[[1]] <- "adm3_en"
label[[2]] <- "adm3_en"
 
layerId <- list()
layerId[[1]] <- "adm3_pcode"
layerId[[2]] <- "adm3_pcode"
 
