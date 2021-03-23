require(ncdf4)
library(lubridate)
library(dplyr)
library(xts) 
library(zoo)
library(extRemes)
library(tidyr)

# ------------------------ import DATA  -----------------------------------
selected_stations <- c('DWRM1', 'DWRM2', 'DWRM3', 'DWRM7', 'DWRM9', 'DWRM10', 'DWRM12', 'DWRM14')
station_file <- read.csv("c:/Users/BOttow/Rode Kruis/510 - Data preparedness and IBF - [CTRY] Uganda/IBF Dashboard data/rp_glofas_station_uga_v2.csv")
station_file %>% filter(used == 'yes')
dir <- "c:/Users/BOttow/Documents/IBF-system/trigger-model-development/flood/skill-assessment/download_glofas/output"
files <- list.files(dir, full.names = T)
listdf <- list()

trigger <- function(files, selected_stations, return_time) {
  for (filess in files) {
    station_name <- strsplit(strsplit(filess, '\\.')[[1]][1], "_")[[1]][5]
    if (station_name %in% selected_stations){
      print(station_name)
      station <- read.csv(filess) %>% mutate(ensemble = paste0("ensemble_",ensemble)) %>% mutate(date = as.Date(date))
      dis_data <- station %>% spread(ensemble, discharge) %>% mutate(mean_all = rowMeans(select(.,-date)))
      
      discharge <- apply.yearly(xts(dis_data$mean_all, order.by=dis_data$date), max)
      
      # calculate return time values
      RT <- return.level(fevd(discharge, data.frame(discharge), units = "cms"), return.period = c(2, 5,10,20,25), do.ci = FALSE)
      rt_time <- ifelse(return_time == 'rt2', 1, ifelse(return_time == 'rt5', 2, ifelse(return_time == 'rt10', 3, 
                                                                                        ifelse(return_time == 'rt20', 4, 5))))
      dis_data <- dis_data %>% mutate(rt = RT[[rt_time]])
      
      # determine number of ensemble runs are above threshold
      dis_data['act'] <- 100 * with(dis_data, rowSums(select(dis_data, starts_with("ens")) > rowMeans(select(dis_data, starts_with("rt")), na.rm = TRUE))) / 10
      dis_data['st'] <- station_name
      
      # filter on probability
      dis_data3 <- dis_data %>% filter(act >= 60)
      
      # filter on > 2 weeks after each other
      dis_data3$days_past <- dis_data3$date - lag(dis_data3$date)
      dis_data3 <- dis_data3 %>% mutate(days_past = ifelse(is.na(days_past), 9999, days_past))
      dis_data2 <- dis_data3 %>% filter(days_past > 14)
      
      listdf[[station_name]] <- dis_data2
    }
  }
  return(listdf)
}

all_glofas_dfs2 <- bind_rows(trigger(files, selected_stations, 'rt2')) %>% mutate(year = year(date))
all_glofas_dfs5 <- bind_rows(trigger(files, selected_stations, 'rt5')) %>% mutate(year = year(date))
all_glofas_dfs10 <- bind_rows(trigger(files, selected_stations, 'rt10')) %>% mutate(year = year(date))
all_glofas_dfs20 <- bind_rows(trigger(files, selected_stations, 'rt20')) %>% mutate(year = year(date))

summary2 <- all_glofas_dfs2 %>% group_by(st) %>% summarize(triggered2 = n())
summary5 <- all_glofas_dfs5 %>% group_by(st) %>% summarize(triggered5 = n())
summary10 <- all_glofas_dfs10 %>% group_by(st) %>% summarize(triggered10 = n())
summary20 <- all_glofas_dfs20 %>% group_by(st) %>% summarize(triggered20 = n())

summary <- summary2 %>% left_join(summary5) %>% left_join(summary10) %>% left_join(summary20)
summary %>% select(-st) %>% colSums(na.rm=T)

library(ggplot2)
p <- ggplot(all_glofas_dfs1, aes(x = date, y = act_rt5, colour = st))
p + geom_point()

