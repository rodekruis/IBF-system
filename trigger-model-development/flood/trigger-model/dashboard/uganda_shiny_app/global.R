library(shiny)
library(janitor)
library(tidyverse)
library(lubridate)
library(plotly)
library(shinydashboard)
library(sf)
library(leaflet)

source('r_resources/plot_functions.R')
source('r_resources/predict_functions.R')

# swi <- read.csv("data/ethiopia_admin3_swi_all.csv", stringsAsFactors = F, colClasses = c("character", "character", "numeric", "numeric", "numeric"))
uga_impact <- read.csv("data/uga_impact_data.csv", stringsAsFactors = F, sep=";")
#rainfall_raw <- read_csv("data/ethiopia_admin3_rainfall.csv")
uga_admin <- sf::read_sf("shapes/uga_admbnda_adm1_UBOS_v2.shp")
uga_admin <- st_transform(uga_admin, crs = "+proj=longlat +datum=WGS84")

glofas_raw <- read_csv("data/GLOFAS_fill_allstation.csv",
                       col_types = cols(time = col_date(format = "%Y-%m-%d"), station = col_character(), .default = col_double())) %>% rename(date = time)
glofas_mapping <- read.csv("data/uga_affected_area_stations.csv", stringsAsFactors = F, sep=";")
########
# glofas_mapping <- read.csv("data/Eth_affected_area_stations.csv", stringsAsFactors = F)
# ethiopia_impact <- read.csv("data/Eth_impact_data2.csv", stringsAsFactors = F, sep=";")
########

filter_on_column <- function(data, column){
  data %>% filter(! is.na(eval(parse(text=column))) & ! eval(parse(text=column)) == "") %>%
    select(name, station = !!column)
}

# Clean impact and keep relevant columns
df_impact_raw <- uga_impact %>%
  clean_names() %>%
  rename(region = name, zone = adm1pcd) %>%
  mutate(date = dmy(date),
         pcode = str_pad(pcode, 6, "left", "0")) %>%
  dplyr::select(region, zone, pcode, date) %>%
  unique() %>%
  arrange(pcode, date)

# Clean GLOFAS mapping
glofas_mapping <- bind_rows(filter_on_column(data = glofas_mapping, column = "Glofas_st"),
                            filter_on_column(data = glofas_mapping, column = "Glofas_st2"),
                            filter_on_column(data = glofas_mapping, column = "Glofas_st3"),
                            filter_on_column(data = glofas_mapping, column = "Glofas_st4")) %>%
  left_join(uga_impact %>% dplyr::select(name, pcode) %>% unique(), by = c("name" = "name")) %>%
  mutate(pcode = str_pad(as.character(pcode), 6, "left", "0")) %>%
  filter(!is.na(pcode))

# Clean glofas
glofas_raw <- glofas_raw %>%
  filter(
    date >= min(df_impact_raw$date, na.rm=T) - 60,
    date <= max(df_impact_raw$date, na.rm=T) + 60)

# Used to join against
all_days <- tibble(date = seq(dmy("01-01-1999") - 60, max(df_impact_raw$date, na.rm=T) + 60, by="days"))

# Clean rainfall
# rainfall_raw <- rainfall_raw %>%
#   mutate(pcode = str_pad(pcode, 6, "left", 0)) %>%
#   filter(
#     date >= min(df_impact_raw$date, na.rm=T) - 60,
#     date <= max(df_impact_raw$date, na.rm=T) + 60)

# # Clean SWI data
# swi_raw <- swi %>%
#   mutate(date = ymd(date))
#
# swi_raw <- swi_raw %>%
#   gather(depth, swi, -pcode, -date)

# Determine floods per Wereda for map
floods_per_region <- df_impact_raw %>%
  group_by(region, pcode) %>%
  summarise(
    n_floods = n()
  ) %>%
  arrange(-n_floods) %>%
  ungroup()

uga_admin <- uga_admin %>%
  left_join(floods_per_region %>% dplyr::select(region,pcode, n_floods) %>% mutate(region = toupper(region)),
            by = c("ADM1_EN" = "region"))

flood_palette <- colorNumeric(palette = "YlOrRd", domain = floods_per_region$n_floods)
