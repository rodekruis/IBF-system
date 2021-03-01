library(tidyverse)
library(lubridate)
library(sf)
library(tmap)

# do you want to only analyze certain zones?
filter_on_zones <- F
crop_zones <- c("ZW15", "ZW16", "ZW21", "ZW24")

periods <- c(1:12)

# calculate the correlation per period
for (period in periods){
  
  # set (output) correlation filename
  res_name <- sprintf("results/cor_maize_major_%s.csv", period)

  setwd('c:/Users/pphung/Documents/GitHub/IBF-system/trigger-model-development/drought/skill-assessment/DMP-VCI-Analysis/dmp_crop_yield_comparison')
  # read DMP dataset
  dmp <- read.csv('results/all_dmp.csv')
  if (filter_on_zones) {dmp <- dmp %>% filter(pcode %in% crop_zones)}
  # read yield dataset
  yield <- read.csv('results/all_yield_maize_major.csv')
  if (filter_on_zones) {yield <- yield %>% filter(pcode %in% crop_zones)}
  # load livelihoodzone shapefile
  lhz <- st_read("c:/Users/pphung/Rode Kruis/510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/zwe_livelihoodzones/ZW_LHZ_2011/ZW_LHZ_2011.shp")
  if (filter_on_zones) {lhz <- lhz %>% filter(LZCODE %in% crop_zones)}

  lhz_pcodes <- tibble(pcode = as.character(lhz$LZCODE),
                       class = substr(as.character(lhz$CLASS),1,2),
                       lznameen = as.character(lhz$LZNAMEEN))

  dmp <- dmp %>%
    mutate(pcode = as.character(pcode),
           date = as_date(date), year = format(as.Date(date, format="%Y/%m/%d"),"%Y"),
           month = format(as.Date(date, format="%Y/%m/%d"),"%m")
    ) %>%
    left_join(lhz_pcodes, by = "pcode")

  # this is to add November and December growing to the harvest in the next year
  dmp$year <- (dmp$month %in% c(11,12)) * 1 + as.numeric(dmp$year)

  # dmp is in kg/ha/day
  # yield is in t/ha/year
  # so if dmp is averaged to kg/ha/day then it should be times growing days divided by 1000 to get tons per year (per ha)
  # period is the growing period
  dmp2 <- dmp  %>%
    left_join(dmp %>% filter(as.numeric(month) %in% period) %>% group_by(pcode,year) %>%
                summarise(dmp_yield_m = length(period) * 30 / 1000 * mean(dmp)),by=c("pcode","year"))

  yield <- yield %>%
    mutate(pcode = as.character(pcode),
           Dates = as_date(paste0(year,'/01/01'), format="%Y/%m/%d")) %>%
    left_join(lhz_pcodes, by = "pcode")

  yield_dmp <- yield %>% mutate(year=as.numeric(year)) %>%
    dplyr::select(-class,-lznameen) %>%
    left_join(dmp2, by = c("pcode", "year")) %>%
    drop_na() %>%
    mutate(com_id=paste0(pcode,year)) %>%
    distinct(com_id, .keep_all = TRUE)

  dat <- yield_dmp %>% gather(var, val, -pcode,-year,-Dates,-date,-month, -class,-lznameen, -dmp,-com_id)

  ggplot(dat, aes(x =  year, y=val, colour = var)) +
    geom_point() +facet_wrap( ~ lznameen)
  
  # correlation calculation
  yield_dmp2 <- yield_dmp %>% # group_by(pcode) %>% mutate(cor_coef_lz = cor(yield, dmp))%>% ungroup() %>% as.data.frame()%>%
    group_by(class) %>% mutate(cor_yield_lzt = cor(yield, dmp_yield_m)) %>% ungroup() %>% as.data.frame() %>%
    group_by(lznameen) %>% mutate(cor_yield_lzn = cor(yield, dmp_yield_m)) %>% ungroup() %>% as.data.frame()

  dat2 <- yield_dmp2 %>% dplyr::select(pcode,year,class,lznameen, cor_yield_lzt, cor_yield_lzn) %>%
    gather(var, val, -pcode,-year,-class,-lznameen)

  ggplot(dat2, aes(x = lznameen, y=val, colour = var)) +
    geom_point() + facet_wrap( ~ class)

  ggplot(dat2, aes(x = class, y=val)) +
    geom_boxplot(outlier.colour="red") + facet_wrap( ~ var) + #theme(axis.text.x = element_text(angle = 90))
    scale_x_discrete(name="Livelyhood Zone") +
    scale_y_continuous(name="Correlation Coeff", limits=c(0, 1))+ ggtitle("Correlation between Crop Yield and DMP")+
    theme(axis.text.x = element_text(face = "bold", color = "#993333",
                                     size = 14, angle = 25, hjust = 1),
          axis.text.y = element_text(face = "bold", color = "blue",
                                     size = 14))

  yield_dmp3 <- yield_dmp2 %>% distinct(pcode, .keep_all = TRUE) %>%
    dplyr::select(pcode,dmp_yield_m,cor_yield_lzt,cor_yield_lzn) %>%
    mutate(LZCODE=pcode)
  print(yield_dmp3)

  lhz2<- lhz %>% left_join(yield_dmp3,by='LZCODE')

  write.csv(yield_dmp3, res_name)
}

# join all periods into a file
period <- periods[1]
res_name <- sprintf("results/cor_maize_major_%s.csv", period)
cor <- read.csv(res_name)
summary <- as.data.frame(t(c(cor$cor_yield_lzn, mean(cor$cor_yield_lzn))))
colnames(summary) <- c(cor$pcode, "mean")
for (period in periods[2:length(periods)]){
  res_name <- sprintf("results/cor_maize_major_%s.csv", period)
  cor <- read.csv(res_name)
  summary[period,] <- c(cor$cor_yield_lzn, mean(cor$cor_yield_lzn))
}
write.csv(summary, "results/cor_maize_major.csv")

#---------------------- vistualize stations and risk areas -------------------------------
tmap_mode(mode = "view")
tm_shape(lhz2) + tm_polygons(col = "cor_yield_lzn", name='LZCODE',
                             palette=c('#fef0d9','#fdd49e','#fdbb84','#fc8d59','#e34a33','#b30000'),
                             breaks=c(0,.1,.3,.4,.6,.8,.9),colorNA=NULL,
                             labels=c('< 0.1','0.1 -0.3','0.3 - 0.4','0.4 - 0.6','0.6 - 0.8','0.8 - 0.9'),
                             title="corr Maize vs DMP",
                             popup.vars = c("LZCODE","cor_yield_lzn"),
                             border.col = "black",lwd = 0.5,lyt='dotted')+
  #tm_shape(Eth_affected_area_stations_ZONE) + tm_symbols(size=0.9,border.alpha = 0.25,col='#045a8d') +
  #tm_symbols(size=0.25,border.alpha = 0.5,col='#bdbdbd') +
  tm_format("NLD")
