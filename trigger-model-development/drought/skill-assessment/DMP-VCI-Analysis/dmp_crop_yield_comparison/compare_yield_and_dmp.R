library(tidyverse)
library(lubridate)
library(sf)

setwd('c:/Users/BOttow/Documents/IBF-system/trigger-model-development/drought/skill-assessment/DMP-VCI-Analysis/dmp_crop_yield_comparison')
dmp <- read.csv('results/all_dmp.csv')
yield <- read.csv('results/all_yield.csv')
lhz <- st_read("c:/Users/BOttow/OneDrive - Rode Kruis/Documenten/IBF/data/ZW_LHZ_2011/ZW_LHZ_2011.shp")

lzh_pcodes <- tibble(pcode = as.character(lhz$LZCODE),
                       class= as.character(lhz$CLASS),
                       lznameen = as.character(lhz$LZNAMEEN))

dmp <- dmp %>%
  mutate(pcode = as.character(pcode),
    date = as_date(date), year = format(as.Date(date, format="%Y/%m/%d"),"%Y"),
    month = format(as.Date(date, format="%Y/%m/%d"),"%m")
  ) %>% left_join(lzh_pcodes, by = "pcode")

# for wheat 07,08,09,10
# for maize mid-march sept 03,04,05,06,07,08,09
# april to july for ZWE

dmp2 <- dmp  %>%
  left_join(dmp %>% filter(month %in% c('07','08','09','10') ) %>% group_by(pcode,year) %>%
                          summarise(dmp_wheat_m = 0.12*mean(dmp)),by=c("pcode","year"))


dmp3<-dmp2  %>%  left_join(dmp %>% filter(month %in% c('03','04','05','06','07','08','09') ) %>% group_by(pcode,year) %>%
              summarise(dmp_maize_m = 0.18*mean(dmp)),by=c("pcode","year"))

yield <- yield %>%
  mutate( pcode = as.character(pcode),
          Dates = as_date(paste0(year,'/01/01'), format="%Y/%m/%d")) %>%
  left_join(lzh_pcodes, by = "pcode")

yield_dmp <- yield %>% mutate(year=as.character(year)) %>%
  select(-class,-lznameen) %>%
  left_join(dmp3, by = c("pcode", "year")) %>%
  drop_na() %>%
  mutate(com_id=paste0(pcode,year)) %>%
  distinct(com_id, .keep_all = TRUE)

dat <- yield_dmp %>% gather(var, val, -pcode,-year,-Dates,-date,-month, -class,-lznameen, -dmp,-com_id)

ggplot(dat, aes(x =  year, y=val, colour = var)) +
  geom_point() +facet_wrap( ~ lznameen)

yield_dmp2<- yield_dmp %>% # group_by(pcode) %>% mutate(cor_coef_lz = cor(yield, dmp))%>% ungroup() %>% as.data.frame()%>%
  group_by(class) %>% mutate(cor_wheat_lzt = cor(yield, dmp_wheat_m),cor_maize_lzt = cor(yield, dmp_maize_m))%>% ungroup() %>% as.data.frame()%>%
  group_by(lznameen) %>% mutate(cor_wheat_lzn = cor(yield, dmp_wheat_m),cor_maize_lzn = cor(yield, dmp_maize_m))%>% ungroup() %>% as.data.frame()

dat<- yield_dmp2 %>% select(pcode,year,class,lznameen,cor_wheat_lzt, cor_maize_lzt, cor_wheat_lzn, cor_maize_lzn) %>%
  gather(var, val, -pcode,-year,-class,-lznameen)

ggplot(dat, aes(x = lznameen, y=val, colour = var)) +
  geom_point() + facet_wrap( ~ class)

ggplot(dat, aes(x = class, y=val)) +
  geom_boxplot(outlier.colour="red") + facet_wrap( ~ var) + #theme(axis.text.x = element_text(angle = 90))
  scale_x_discrete(name="Livelyhood Zone") +
  scale_y_continuous(name="Correlation Coeff", limits=c(0, 1))+ ggtitle("Correlation between Crop Yield and DMP")+
  theme(axis.text.x = element_text(face = "bold", color = "#993333",
                                 size = 14, angle = 25, hjust = 1),
      axis.text.y = element_text(face = "bold", color = "blue",
                                 size = 14))

yield_dmp3 <- yield_dmp2 %>% distinct(pcode, .keep_all = TRUE) %>%
  select(pcode,dmp_wheat_m,dmp_maize_m,cor_wheat_lzt,cor_maize_lzt,cor_wheat_lzn,cor_maize_lzn,cor_wheat_ad,cor_maize_lad)%>%
  mutate(LZCODE=pcode)

lhz2<- lhz %>% left_join(yield_dmp3,by='LZCODE')





#---------------------- vistualize stations and risk areas -------------------------------
tmap_mode(mode = "view")
tm_shape(Eth_LZH2) + tm_polygons(col = "cor_maize_lzn", name='W_Name',
                                       palette=c('#fef0d9','#fdd49e','#fdbb84','#fc8d59','#e34a33','#b30000'),
                                       breaks=c(0,.1,.3,.4,.6,.8,.9),colorNA=NULL,
                                       labels=c('< 0.1','0.1 -0.3','0.3 - 0.4','0.4 - 0.6','0.6 - 0.8','0.8 - 0.9'),
                                       title="corr Maize vs DMP",
                                       border.col = "black",lwd = 0.5,lyt='dotted')+
  #tm_shape(Eth_affected_area_stations_ZONE) + tm_symbols(size=0.9,border.alpha = 0.25,col='#045a8d') +
  #tm_symbols(size=0.25,border.alpha = 0.5,col='#bdbdbd') +
  tm_format("NLD")
tmap_mode(mode = "view")
tm_shape(Eth_LZH2) + tm_polygons(col = "cor_wheat_lzn", name='W_Name',
                                 palette=c('#fef0d9','#fdd49e','#fdbb84','#fc8d59','#e34a33','#b30000'),
                                 breaks=c(0,.1,.3,.4,.6,.8,.9),colorNA=NULL,
                                 labels=c('< 0.1','0.1 -0.3','0.3 - 0.4','0.4 - 0.6','0.6 - 0.8','0.8 - 0.9'),
                                 title="corr Wheat vs DMP",
                                 border.col = "black",lwd = 0.5,lyt='dotted')+
  #tm_shape(Eth_affected_area_stations_ZONE) + tm_symbols(size=0.9,border.alpha = 0.25,col='#045a8d') +
  #tm_symbols(size=0.25,border.alpha = 0.5,col='#bdbdbd') +
  tm_format("NLD")


