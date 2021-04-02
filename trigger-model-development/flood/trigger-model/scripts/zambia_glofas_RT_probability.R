rm(list=ls())
require(ncdf4)
library(lubridate)
library(dplyr)
library(xts) 
library(zoo)
library(extRemes)
library(janitor)
library(tidyverse)

library(ggplot2)
# ------------------------ import DATA  -----------------------------------

path='C:/Users/ATeklesadik/OneDrive - Rode Kruis/Documents/documents/GLOFAS/glofas'



zambia_glofas_stations<-read.csv('C:/Users/ATeklesadik/OneDrive - Rode Kruis/Documents/documents/GLOFAS/Glofas_station_per_district_new.csv',sep=';')%>%
  dplyr::mutate(district=tolower(PROVINCE))%>%filter(st!='no_station')%>%dplyr::select(st,district)

df_impact <- read.csv("C:/Users/ATeklesadik/OneDrive - Rode Kruis/Documents/documents/zambia/flood_year_per_district.txt")%>%clean_names()%>%
  gather('district','flood',-flood_year)%>%
  dplyr::mutate(Date=format(strptime(flood_year, format = "%Y"), '%Y-%m-%d'))%>%filter(flood>0)

setwd(path)

files<-list.files(path, pattern='.nc', all.files=FALSE,full.names=TRUE)
start_date <- ymd_hms("1997-01-02 00:00:00")
'%ni%' <- Negate('%in%')

listdf<-list()
for (filess in files)
  {
  file_name=strsplit(strsplit(filess,'/')[[1]][9],'_')[[1]][5]
  
  print(file_name)
  
 #if (file_name %in% c('G1067','G1053','G4953','G1603','G1074','G1902','G1045','G6107','G1901','G6109','G5115','G1907','G5081','KEGVS16','G1904'))
 if (file_name %in% unique(zambia_glofas_stations$st))
   {    
   
   print(file_name)   
   

    nc<-nc_open(filess)
    time <- ncvar_get(nc, "time")
    data <- ncvar_get(nc, "dis") 
    dis_data<-data.frame(t(data[1:11,3,]))%>%dplyr::mutate(date=start_date + hours(time),step=3) 
  
    names(dis_data)<-c('ensm1','ensm2','ensm3','ensm4','ensm5','ensm6','ensm7','ensm8','ensm9','ensm10','ensm11','Date','step')
    
    dis_data<-dis_data %>%dplyr::mutate(mean_ds = rowMeans(select(dis_data, starts_with("ensm")), na.rm = TRUE))%>%
      rowwise() %>% 
      dplyr::mutate(median_ds = median(c(ensm1,ensm2,ensm3,ensm4,ensm5,ensm6,ensm7,ensm8,ensm9,ensm10,ensm11), na.rm = TRUE))
    
    
    discharge<-apply.yearly(xts(dis_data$mean_ds, order.by=dis_data$Date), max)
    RT<-return.level(fevd(discharge, data.frame(discharge), units = "cms"), return.period = c(2, 5,10,20,25), do.ci = FALSE)
    
    dis_data<-dis_data %>% mutate(rt2=RT[[1]],rt5=RT[[2]],rt10=RT[[3]])
    dis_data['act_rt5']<-100*with(dis_data, rowSums(select(dis_data, starts_with("ensm")) > rowMeans(select(dis_data, starts_with("rt5")), na.rm = TRUE)))/11
    dis_data['act_rt10']<-100*with(dis_data, rowSums(select(dis_data, starts_with("ensm")) > rowMeans(select(dis_data, starts_with("rt10")), na.rm = TRUE)))/11
    fname<-paste0("C:/Users/ATeklesadik/OneDrive - Rode Kruis/Documents/documents/GLOFAS/glofas_csv/",strsplit(strsplit(filess,'/')[[1]][9],'_')[[1]][5],'_step_3.csv')
    #write.csv(dis_data,fname,append = FALSE)
    dis_data['st']<-file_name
    dis_data3<-dis_data %>% filter(act_rt5>50)
     
    
    dis_data<-data.frame(t(data[1:11,7,]))%>%mutate(date=start_date + hours(time),step=7) 
    
    names(dis_data)<-c('ensm1','ensm2','ensm3','ensm4','ensm5','ensm6','ensm7','ensm8','ensm9','ensm10','ensm11','Date','step')
    
    dis_data<-dis_data %>% mutate(mean_ds = rowMeans(select(dis_data, starts_with("ensm")), na.rm = TRUE))%>%
      rowwise() %>% 
      mutate(median_ds = median(c(ensm1,ensm2,ensm3,ensm4,ensm5,ensm6,ensm7,ensm8,ensm9,ensm10,ensm11), na.rm = TRUE))
    
    
    discharge<-apply.yearly(xts(dis_data$mean_ds, order.by=dis_data$Date), max)
    RT<-return.level(fevd(discharge, data.frame(discharge), units = "cms"), return.period = c(2, 5,10,20,25), do.ci = FALSE)
    
    dis_data<-dis_data %>% mutate(rt2=RT[[1]],rt5=RT[[2]],rt10=RT[[3]])
    dis_data['act_rt5']<-100*with(dis_data, rowSums(select(dis_data, starts_with("ensm")) > rowMeans(select(dis_data, starts_with("rt5")), na.rm = TRUE)))/11
    dis_data['act_rt10']<-100*with(dis_data, rowSums(select(dis_data, starts_with("ensm")) > rowMeans(select(dis_data, starts_with("rt10")), na.rm = TRUE)))/11
   
    fname<-paste0("C:/Users/ATeklesadik/OneDrive - Rode Kruis/Documents/documents/GLOFAS/glofas_csv/",strsplit(strsplit(filess,'/')[[1]][9],'_')[[1]][5],'_step_7.csv')
    #write.csv(dis_data,fname,append = FALSE)
    dis_data['st']<-file_name
    nc_close( nc )
    dis_data<-dis_data %>% filter(act_rt5>50)
    
    listdf[[file_name]] <-rbind(dis_data,dis_data3)
 }
}

all_glofas_dfs1 <- bind_rows(listdf) %>% mutate(year= year(Date)) #%>% filter(act_rt10>50 ) 

df_impact<-data.frame(date=unique(drop_na(df_impact)$Date),val=60)

all_glofas_dfs<-all_glofas_dfs1 %>%left_join(zambia_glofas_stations ,by='st')
 

agg = aggregate(all_glofas_dfs1,
                by = list(all_glofas_dfs1$year, all_glofas_dfs1$step),
                FUN = max)

#agg2 = aggregate(all_glofas_dfs%>%select(st,rt10,step,district),by = list(all_glofas_dfs1$st, all_glofas_dfs1$step), FUN = max)







ggplot(agg %>% filter(step>4 ) , aes(Date, act_rt10, colour = factor(step)), size = 7) + 
  geom_point(shape = 21, alpha = 0.75, size = 3)

 


ggplot(all_glofas_dfs %>% filter(act_rt10 >50 )%>% filter(step>4 )  ,
       aes(Date, act_rt10, fill = factor(district)), size = 4) + 
  geom_point(position=position_jitter(h=0.5, w=0.5),
             shape = 24, alpha = 0.99, size = 3) + 
  geom_hline(yintercept=75, 
             color = "red",size=0.2)+
  geom_vline(xintercept =as.POSIXct(as.Date(df_impact$date)),linetype="dashed",
             size = .2, colour = "grey")+
  labs(x="years", y="Maximum probability of dlow exceding \n 10 year return period threshold",
       title = " Yearly maximum probability for flow exceding a 10 year return period threshold at any of the GLOFAS stations in the trigger table \n [with  10 year return period threshold with 75% probability @ 7 day lead time 11 EAP Activations in 24 years]\n Vertical grey lines indicate repoted flood based on impact data")+ 
  labs(fill = "Provinces where EAP \n have been Activated") +
  theme(text = element_text(size=12),
        axis.title.x = element_text(color = "grey20", size = 12, angle = 0, hjust = .5, vjust = 0, face = "plain"),
        axis.title.y = element_text(color = "grey20", size = 12, angle = 90, hjust = .5, vjust = 0, face = "plain"),
        axis.text.x = element_text(color = "grey20", size = 10,angle=90, hjust=1)) 



ggplot(all_glofas_dfs %>% filter(act_rt10 >50 )%>% filter(step<4 )  ,
       aes(Date, act_rt10,fill = factor(district)), size = 4) + 
  geom_point(position=position_jitter(h=0.5, w=0.5),
             shape = 21, alpha = 0.95, size = 3) + 
  geom_hline(yintercept=85, 
             color = "red",size=0.2)+
  geom_vline(xintercept =as.POSIXct(as.Date(df_impact$date)),linetype="dashed",
             size = .2, colour = "grey")+
  labs(x="years", y="Maximum probability of flow exceding \n 10 year return period threshold",
       title = " Yearly maximum probability for flow exceding a 10 year return period threshold at any of the GLOFAS stations in the trigger table \n [with  10 year return period threshold with 85% probability @ 3 day lead time 13 EAP Activations in 24 years]\n Vertical grey lines indicate repoted flood based on impact data" )+ 
  labs(fill = "Provinces where EAP \n have been Activated") +
  theme(text = element_text(size=14),
        axis.title.x = element_text(color = "grey20", size = 14, angle = 0, hjust = .5, vjust = 0, face = "plain"),
        axis.title.y = element_text(color = "grey20", size = 14, angle = 90, hjust = .5, vjust = 0, face = "plain"),
        axis.text.x = element_text(color = "grey20", size = 10,angle=90, hjust=1)) 


