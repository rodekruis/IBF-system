library(tidyverse)
library(lubridate)
library(sf)

setwd('C:\\Users\\ATeklesadik\\OneDrive - Rode Kruis\\Documents\\documents\\IBF-system\\trigger-model-development\\drought\\skill-assessment\\DMP-VCI-Analysis\\dmp_vci_comparison')

dmp <- read.csv('results/all_dmp.csv')

yield <- read.csv('results/all_yield.csv')


 
Eth_LZH <- st_read("admin_shapes/ET_LHZ_2018/ET_LHZ_2018.shp")

Eth_LZH_pcodes <- tibble(pcode = as.character(Eth_LZH$LZCODE),
                       County= as.character(Eth_LZH$ADMIN1),
                       LZTYPE= as.character(Eth_LZH$LZTYPE),
                       LZNAMEEN = as.character(Eth_LZH$LZNAMEEN))

dmp <- dmp %>%
  mutate(pcode = as.character(pcode),
    date = as_date(date), year = format(as.Date(date, format="%Y/%m/%d"),"%Y"),
    month = format(as.Date(date, format="%Y/%m/%d"),"%m")
  ) %>% left_join(Eth_LZH_pcodes, by = "pcode")

# for wheat 07,08,09,10
# for maize mid-march sept 03,04,05,06,07,08,09

dmp2<-dmp  %>%
  left_join(dmp %>% filter(month %in% c('07','08','09','11') ) %>% group_by(pcode,year) %>% 
                          summarise(dmp_wheat_m = 0.12*mean(dmp)),by=c("pcode","year"))
 

dmp3<-dmp2  %>%  left_join(dmp %>% filter(month %in% c('03','04','05','06','07','08','09') ) %>% group_by(pcode,year) %>% 
              summarise(dmp_maize_m = 0.18*mean(dmp)),by=c("pcode","year"))





yield <- yield %>%
  mutate( pcode = as.character(pcode),
          Dates = as_date(paste0(year,'/01/01'), format="%Y/%m/%d")) %>% 
  left_join(Eth_LZH_pcodes, by = "pcode")


Yield_DMP<-yield %>% mutate(year=as.character(year)) %>%
  select(-County,-LZTYPE,-LZNAMEEN) %>% 
  left_join(dmp3, by = c("pcode", "year")) %>% drop_na()  %>% mutate(com_id=paste0(pcode,year)) %>% distinct(com_id, .keep_all = TRUE)

dat<- Yield_DMP %>% gather(var, val, -pcode,-year,-Dates,-date,-month,-County,-LZTYPE,-LZNAMEEN, -dmp,-com_id)

ggplot(dat, aes(x =  year, y=val, colour = var)) +
  geom_point() +facet_wrap( ~ County)



Yield_DMP2<- Yield_DMP %>% # group_by(pcode) %>% mutate(cor_coef_lz = cor(yield, dmp))%>% ungroup() %>% as.data.frame()%>% 
  group_by(LZTYPE) %>% mutate(cor_wheat_lzt = cor(yield, dmp_wheat_m),cor_maize_lzt = cor(yield, dmp_maize_m))%>% ungroup() %>% as.data.frame()%>%
  group_by(LZNAMEEN) %>% mutate(cor_wheat_lzn =cor(yield, dmp_wheat_m),cor_maize_lzn = cor(yield, dmp_maize_m))%>% ungroup() %>% as.data.frame()%>%
  group_by(County) %>% mutate(cor_wheat_ad =cor(yield, dmp_wheat_m),cor_maize_lad = cor(yield, dmp_maize_m))%>% ungroup() %>% as.data.frame()

dat<- Yield_DMP2 %>% select(pcode,year,County,LZTYPE ,LZNAMEEN,cor_wheat_lzt, cor_maize_lzt, cor_wheat_lzn, cor_maize_lzn) %>% 
  gather(var, val, -pcode,-year,-County,-LZTYPE,-LZNAMEEN) 

ggplot(dat, aes(x =  County, y=val, colour = var)) +
  geom_point() +facet_wrap( ~ LZTYPE)

ggplot(dat, aes(x=LZTYPE, y=val)) + 
  geom_boxplot(outlier.colour="red") +facet_wrap( ~ var) + #theme(axis.text.x = element_text(angle = 90))
  scale_x_discrete(name="Livelyhood Zone") +
  scale_y_continuous(name="Correlation Coeff", limits=c(0, 1))+ ggtitle("Correlation between Crop Yield and DMP")+
  theme(axis.text.x = element_text(face = "bold", color = "#993333", 
                                 size = 14, angle = 25, hjust = 1),
      axis.text.y = element_text(face = "bold", color = "blue", 
                                 size = 14))

Yield_DMP3<-Yield_DMP2 %>% distinct(pcode, .keep_all = TRUE) %>% 
  select(pcode,dmp_wheat_m,dmp_maize_m,cor_wheat_lzt,cor_maize_lzt,cor_wheat_lzn,cor_maize_lzn,cor_wheat_ad,cor_maize_lad)%>%
  mutate(LZCODE=pcode)

Eth_LZH2<- Eth_LZH %>%left_join(Yield_DMP3,by='LZCODE')





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


