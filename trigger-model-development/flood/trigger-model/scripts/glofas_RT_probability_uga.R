require(ncdf4)
library(lubridate)
library(dplyr)
library(xts) 
library(zoo)
library(extRemes)
library(tidyr)

# ------------------------ import DATA  -----------------------------------
station_file <- read.csv("c:/Users/BOttow/Rode Kruis/510 - Data preparedness and IBF - [CTRY] Uganda/IBF Dashboard data/rp_glofas_station_uga_v2.csv")
station_data <- station_file %>% filter(used == 'yes')
selected_stations <- station_data$ID
dir <- "c:/Users/BOttow/Documents/IBF-system/trigger-model-development/flood/skill-assessment/download_glofas/output"
files <- list.files(dir, full.names = T, pattern = ".*DWRM[0-9]+.csv")
listdf <- list()

trigger <- function(files, selected_stations, return_time, probability = 60) {
  for (filess in files) {
    station_name <- strsplit(strsplit(filess, '\\.')[[1]][1], "_")[[1]][5]
    if (station_name %in% selected_stations){
      print(station_name)
      station <- read.csv(filess) %>% mutate(ensemble = paste0("ensemble_",ensemble)) %>% mutate(date = as.Date(date))
      control <- read.csv(sprintf("%s_control_reforecast.csv", substring(filess,1,nchar(filess)-4))) %>% 
        mutate(ensemble = "ensemble_0") %>% mutate(date = as.Date(date))
      dis_data <- rbind(station, control) %>% spread(ensemble, discharge) %>% 
        mutate(mean_all = rowMeans(select(.,-date), na.rm = T))
      
      
      # calculate return time values
      discharge <- apply.yearly(xts(dis_data$mean_all, order.by=dis_data$date), max)
      RT <- return.level(fevd(discharge, data.frame(discharge), units = "cms"), return.period = c(2, 5,10,20,25), do.ci = FALSE)
      rt_time <- ifelse(return_time == 'rt2', 1, ifelse(return_time == 'rt5', 2, ifelse(return_time == 'rt10', 3, 
                                                                                        ifelse(return_time == 'rt20', 4, 5))))
      dis_data <- dis_data %>% mutate(rt = RT[[rt_time]])
      
      # determine number of ensemble runs are above threshold
      dis_data['act'] <- 100 * with(dis_data, rowSums(select(dis_data, starts_with("ens")) > rowMeans(select(dis_data, starts_with("rt")), na.rm = TRUE))) / (ncol(dis_data) - 3)
      dis_data['st'] <- station_name
      
      # filter on probability
      dis_data3 <- dis_data %>% filter(act >= probability)
      
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
summary$name <- station_data$location[match(summary$st, station_data$ID)]
summary %>% select(-st, -name) %>% colSums(na.rm=T)

library(ggplot2)
p <- ggplot(all_glofas_dfs1, aes(x = date, y = act_rt5, colour = st))
p + geom_point()

