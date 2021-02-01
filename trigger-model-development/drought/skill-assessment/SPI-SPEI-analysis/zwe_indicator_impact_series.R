rm(list=ls())
library(dplyr)
library(tidyverse)
library(raster)
library(sf)
library(velox)
library(stringr)
library(ncdf4)
library(exactextractr)
library(lubridate)
library(ggplot2)
library(ggthemes)

##################################################
################ Load shapefiles ################
##################################################

zwe_lzh <- st_read('D:/Drought_IBF/dmp_vci_analysis/ZW_LHZ_2011/ZW_LHZ_2011.shp')
zwe_ <- st_read('D:/Drought_IBF/admin/zwe_admbnda_adm0_zimstat_ocha_20180911/zwe_admbnda_adm0_zimstat_ocha_20180911.shp')

##################################################
##################### ENSO ######################
##################################################

IOD <- read.csv("D:/Drought_IBF/general_data/IOD.csv")


ENSO <- read.csv("D:/Drought_IBF/general_data/ENSO.csv")


IOD<-IOD %>% gather("MON",'IOD',-year) %>% arrange(year) %>%  mutate(dates_=seq(as.Date("1950/01/01"), by = "month", length.out = 852),
                                                                       col = ifelse(OID>=0,'p', 'n'))%>%filter(dates_ >= as.Date("1980/01/01"))


iodgrap <-ggplot() + geom_area(data=IOD, aes(x=year, y=IOD))

iodgrap<-ggplot() + geom_area(data=IOD, aes(x=year, y=IOD)) +
  geom_hline(yintercept=2, linetype="dashed", color = "red") +
  geom_hline(yintercept=1, linetype="dashed", color = "red") +
  geom_hline(yintercept=-1.0, linetype="dashed", color = "blue") +
  geom_hline(yintercept=-2.0, linetype="dashed", color = "blue") +
  #geom_vline(xintercept = as.Date("1982/10/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("1991/04/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("1998/11/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("2001/03/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("2007/01/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("2010/05/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("2013/01/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("2019/02/01"),color='#f03b20',size=.3) +
  scale_x_date(name="time",date_breaks="24 months")+
  #scale_x_date(name="time") + 
  scale_y_continuous(name="SST anomalies") + 
  coord_cartesian(ylim=c(-2,2.5)) +
  ggtitle('3 month running mean of ERSST.v5 SST anomalies in the Ni?o  3.4 region \n (5oN-5oS, 120o-170oW)')+
  theme(text = element_text(size=15),
        axis.text.x = element_text( size = 9, angle = 90,hjust = 1),
        axis.text.y = element_text( size = 10, angle = 0),
        plot.title=element_text(size=18),
        plot.background = element_rect(fill = "transparent",colour = NA)) 

ggsave(filename=paste0("D:/Drought_IBF/zwe/",'iod_withoutEMDAT.png'),plot=iodgrap, width = 30, height = 20, units = "cm")


ENSO<-ENSO %>% gather("MON",'ONI',-Year) %>% arrange(Year) %>%  mutate(dates_=seq(as.Date("1950/01/01"), by = "month", length.out = 852),
         col = ifelse(ONI>=0,'p', 'n'))%>%filter(dates_ >= as.Date("1980/01/01"))


ensograp<-ggplot() + geom_area(data=ENSO, aes(x=dates_, y=ONI)) +
  geom_hline(yintercept=2, linetype="dashed", color = "red") +
  geom_hline(yintercept=1, linetype="dashed", color = "red") +
  geom_hline(yintercept=-1.0, linetype="dashed", color = "blue") +
  geom_hline(yintercept=-2.0, linetype="dashed", color = "blue") +
  #geom_vline(xintercept = as.Date("1983/01/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("1987/01/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("1988/01/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("1989/01/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("1991/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("1992/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("1995/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2002/01/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("2003/01/01"),color='#f03b20',size=.3) + 
  geom_vline(xintercept = as.Date("2005/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2008/01/01"),color='#f03b20',size=.3) + 
  geom_vline(xintercept = as.Date("2009/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2015/01/01"),color='#f03b20',size=.3) +
  scale_x_date(name="time",date_breaks="24 months")+
  #scale_x_date(name="time") + 
  scale_y_continuous(name="SST anomalies") + 
  coord_cartesian(ylim=c(-2,2.5)) +
  ggtitle('3 month running mean of ERSST.v5 SST anomalies in the Ni?o  3.4 region \n (5oN-5oS, 120o-170oW)')+
  theme(text = element_text(size=15),
        axis.text.x = element_text( size = 9, angle = 90,hjust = 1),
        axis.text.y = element_text( size = 10, angle = 0),
        plot.title=element_text(size=18),
        plot.background = element_rect(fill = "transparent",colour = NA)) 

ggsave(filename=paste0("D:/Drought_IBF/zwe/",'enso_.png'),plot=ensograp, width = 30, height = 20, units = "cm")



##################################################
### SPI 1 month, 3 month, 6 month and 12 month ###
##################################################

spi1 <- brick("D:/Drought_IBF/general_data/e2o_ecmwf_wrr1_glob30_mon_SPI_1_1983_2012.nc")
spi_LHZ <- exact_extract(spi1, zwe_lzh, 'mean')
spi_LHZ <- as.data.frame(t(as.matrix(spi_LHZ)), col.names =as.character(zwe_lzh$FNID)  )
names(spi_LHZ)<-as.character(zwe_lzh$FNID)
spi_LHZ<-spi_LHZ %>% mutate(ID=rownames(spi_LHZ)) %>% mutate(ID=gsub("[.]", "/", substr(ID, 7, 16))) %>% mutate(date=as_date(ID))
rownames(spi_LHZ) <-spi_LHZ$date 
spi_LHZ %>% dplyr::select(ZW2011L125)

rect_data <- data.frame(xmin=min(spi_LHZ$date),
                        xmax=max(spi_LHZ$date),
                        ymin=c(-4,-2,-1),
                        ymax=c(-2,-1,0),
                        col=c("#de2d26","#fc9272","#fee0d2"))

scatwinddam<-ggplot() +
  geom_line(data=spi_LHZ %>% dplyr::select(ZW2011L125,date), aes(x=date, y=ZW2011L125), color = "blue",size=.5)+
  geom_hline(yintercept=-2, linetype="dashed", color = "red",size=1) +
  geom_hline(yintercept=0, linetype="dashed", color = "black",size=.1) +
  geom_hline(yintercept=-1.0, linetype="dashed", color = "orange",size=1) +
  #geom_vline(xintercept = as.Date("1983/01/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("1987/01/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("1988/01/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("1989/01/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("1991/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("1992/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("1995/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2002/01/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("2003/01/01"),color='#f03b20',size=.3) + 
  geom_vline(xintercept = as.Date("2005/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2008/01/01"),color='#f03b20',size=.3) + 
  geom_vline(xintercept = as.Date("2009/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2015/01/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("1998/11/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("2001/03/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("2007/01/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("2010/05/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("2013/01/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("2019/02/01"),color='#f03b20',size=.3) +
  scale_x_date(name="time",date_breaks="24 months")+
  #scale_x_date(name="time") + 
  scale_y_continuous(name="SPI 1")+ 
  geom_rect(data=rect_data, aes(xmin=xmin,xmax=xmax,ymin=ymin,ymax=ymax,fill=col),alpha=0.2)+
  scale_fill_identity()+
  coord_cartesian(ylim=c(-4.0,3.5)) +
  ggtitle('SPI 1 month for (ZW25) + Impact baseline crop yield data for Zimbabwe')+
  theme(text = element_text(size=15),
        axis.text.x = element_text( size = 9, angle = 90,hjust = 1),
        axis.text.y = element_text( size = 10, angle = 0),
        plot.title=element_text(size=18),
        legend.position = c(0.8, 0.2), 
        plot.background = element_rect(fill = "transparent",colour = NA)) 


ggsave(filename=paste0("D:/Drought_IBF/zwe/SPI/",'SPI1_ZW2011L125.png'),plot=scatwinddam, width = 30, height = 20, units = "cm")

#################SPI-3###############################

spi3 <- brick("D:/Drought_IBF/general_data/e2o_ecmwf_wrr1_glob30_mon_SPI_3_1983_2012.nc")
spi_LHZ <- exact_extract(spi3, zwe_lzh, 'mean')
spi_LHZ <- as.data.frame(t(as.matrix(spi_LHZ)), col.names =as.character(zwe_lzh$FNID)  )
names(spi_LHZ)<-as.character(zwe_lzh$FNID)
spi_LHZ<-spi_LHZ %>% mutate(ID=rownames(spi_LHZ)) %>% mutate(ID=gsub("[.]", "/", substr(ID, 7, 16))) %>% mutate(date=as_date(ID))
rownames(spi_LHZ) <-spi_LHZ$date 
spi_LHZ %>% dplyr::select(ZW2011L102)

rect_data <- data.frame(xmin=min(spi_LHZ$date),
                        xmax=max(spi_LHZ$date),
                        ymin=c(-4,-2,-1),
                        ymax=c(-2,-1,0),
                        col=c("#de2d26","#fc9272","#fee0d2"))

scatwinddam<-ggplot() +
  geom_line(data=spi_LHZ %>% dplyr::select(ZW2011L102,date), aes(x=date, y=ZW2011L102), color = "blue",size=.5)+
  geom_hline(yintercept=-2, linetype="dashed", color = "red",size=1) +
  geom_hline(yintercept=0, linetype="dashed", color = "black",size=.1) +
  geom_hline(yintercept=-1.0, linetype="dashed", color = "orange",size=1) +
  #geom_vline(xintercept = as.Date("1983/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("1992/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2002/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2003/01/01"),color='#f03b20',size=.3) + 
  geom_vline(xintercept = as.Date("2005/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2008/01/01"),color='#f03b20',size=.3) + 
  geom_vline(xintercept = as.Date("2009/01/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("2015/01/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("1998/11/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("2001/03/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("2007/01/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("2010/05/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("2013/01/01"),color='#f03b20',size=.3) +
  #geom_vline(xintercept = as.Date("2019/02/01"),color='#f03b20',size=.3) +
  scale_x_date(name="time",date_breaks="24 months")+
  #scale_x_date(name="time") + 
  scale_y_continuous(name="SPI 3")+ 
  geom_rect(data=rect_data, aes(xmin=xmin,xmax=xmax,ymin=ymin,ymax=ymax,fill=col),alpha=0.2)+
  scale_fill_identity()+
  coord_cartesian(ylim=c(-4.0,3.5)) +
  ggtitle('SPI 3 month for (ZW02) + Impact baseline crop yield data for Zimbabwe')+
  theme(text = element_text(size=15),
        axis.text.x = element_text( size = 9, angle = 90,hjust = 1),
        axis.text.y = element_text( size = 10, angle = 0),
        plot.title=element_text(size=18),
        legend.position = c(0.8, 0.2), 
        plot.background = element_rect(fill = "transparent",colour = NA)) 


ggsave(filename=paste0("D:/Drought_IBF/zwe/SPI/",'SPI3_ZW2011L102.png'),plot=scatwinddam, width = 30, height = 20, units = "cm")

###################SPI-6#############################

spi6 <- brick("D:/Drought_IBF/general_data/e2o_ecmwf_wrr1_glob30_mon_SPI_6_1983_2012.nc")
spi_LHZ <- exact_extract(spi6, zwe_lzh, 'mean')
spi_LHZ <- as.data.frame(t(as.matrix(spi_LHZ)), col.names =as.character(zwe_lzh$FNID)  )
names(spi_LHZ)<-as.character(zwe_lzh$FNID)
spi_LHZ<-spi_LHZ %>% mutate(ID=rownames(spi_LHZ)) %>% mutate(ID=gsub("[.]", "/", substr(ID, 7, 16))) %>% mutate(date=as_date(ID))
rownames(spi_LHZ) <-spi_LHZ$date 
spi_LHZ %>% dplyr::select(ZW2011L102)

rect_data <- data.frame(xmin=min(spi_LHZ$date),
                        xmax=max(spi_LHZ$date),
                        ymin=c(-4,-2,-1),
                        ymax=c(-2,-1,0),
                        col=c("#de2d26","#fc9272","#fee0d2"))

scatwinddam<-ggplot() +
  geom_line(data=spi_LHZ %>% dplyr::select(ZW2011L102,date), aes(x=date, y=ZW2011L102), color = "blue",size=.5)+
  geom_hline(yintercept=-2, linetype="dashed", color = "red",size=1) +
  geom_hline(yintercept=0, linetype="dashed", color = "black",size=.1) +
  geom_hline(yintercept=-1.0, linetype="dashed", color = "orange",size=1) +
  geom_vline(xintercept = as.Date("1992/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2002/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2003/01/01"),color='#f03b20',size=.3) + 
  geom_vline(xintercept = as.Date("2005/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2008/01/01"),color='#f03b20',size=.3) + 
  geom_vline(xintercept = as.Date("2009/01/01"),color='#f03b20',size=.3) +
  scale_x_date(name="time",date_breaks="24 months")+
  #scale_x_date(name="time") + 
  scale_y_continuous(name="SPI 6")+ 
  geom_rect(data=rect_data, aes(xmin=xmin,xmax=xmax,ymin=ymin,ymax=ymax,fill=col),alpha=0.2)+
  scale_fill_identity()+
  coord_cartesian(ylim=c(-4.0,3.5)) +
  ggtitle('SPI 6 month for (ZW02) + Impact baseline crop yield data for Zimbabwe')+
  theme(text = element_text(size=15),
        axis.text.x = element_text( size = 9, angle = 90,hjust = 1),
        axis.text.y = element_text( size = 10, angle = 0),
        plot.title=element_text(size=18),
        plot.background = element_rect(fill = "transparent",colour = NA)) 


ggsave(filename=paste0("D:/Drought_IBF/zwe/SPI/",'SPI6_ZW2011L102.png'),plot=scatwinddam, width = 30, height = 20, units = "cm")

###################SPI-12#############################

spi12 <- brick("D:/Drought_IBF/general_data/e2o_ecmwf_wrr1_glob30_mon_SPI_12_1983_2012.nc")
spi_LHZ <- exact_extract(spi12, zwe_lzh, 'mean')
spi_LHZ <- as.data.frame(t(as.matrix(spi_LHZ)), col.names =as.character(zwe_lzh$FNID)  )
names(spi_LHZ)<-as.character(zwe_lzh$FNID)
spi_LHZ<-spi_LHZ %>% mutate(ID=rownames(spi_LHZ)) %>% mutate(ID=gsub("[.]", "/", substr(ID, 7, 16))) %>% mutate(date=as_date(ID))
rownames(spi_LHZ) <-spi_LHZ$date 
spi_LHZ %>% dplyr::select(ZW2011L102)

rect_data <- data.frame(xmin=min(spi_LHZ$date),
                        xmax=max(spi_LHZ$date),
                        ymin=c(-4,-2,-1),
                        ymax=c(-2,-1,0),
                        col=c("#de2d26","#fc9272","#fee0d2"))

scatwinddam<-ggplot() +
  geom_line(data=spi_LHZ %>% dplyr::select(ZW2011L102,date), aes(x=date, y=ZW2011L102), color = "blue",size=.5)+
  geom_hline(yintercept=-2, linetype="dashed", color = "red",size=1) +
  geom_hline(yintercept=0, linetype="dashed", color = "black",size=.1) +
  geom_hline(yintercept=-1.0, linetype="dashed", color = "orange",size=1) +
  geom_vline(xintercept = as.Date("1992/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2002/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2003/01/01"),color='#f03b20',size=.3) + 
  geom_vline(xintercept = as.Date("2005/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2008/01/01"),color='#f03b20',size=.3) + 
  geom_vline(xintercept = as.Date("2009/01/01"),color='#f03b20',size=.3) +
  scale_x_date(name="time",date_breaks="24 months")+
  #scale_x_date(name="time") + 
  scale_y_continuous(name="SPI 12")+ 
  geom_rect(data=rect_data, aes(xmin=xmin,xmax=xmax,ymin=ymin,ymax=ymax,fill=col),alpha=0.2)+
  scale_fill_identity()+
  coord_cartesian(ylim=c(-4.0,3.5)) +
  ggtitle('SPI 12 month for (ZW02) + Impact baseline crop yield data for Zimbabwe')+
  theme(text = element_text(size=15),
        axis.text.x = element_text( size = 9, angle = 90,hjust = 1),
        axis.text.y = element_text( size = 10, angle = 0),
        plot.title=element_text(size=18),
        plot.background = element_rect(fill = "transparent",colour = NA)) 


ggsave(filename=paste0("D:/Drought_IBF/zwe/SPI/",'SPI12_ZW2011L102.png'),plot=scatwinddam, width = 30, height = 20, units = "cm")


##################################################
### SPEI 1 month, 3 month, 6 month and 12 month ###
##################################################

spei1 <- brick("D:/Drought_IBF/general_data/spei01.nc")
spei_LHZ <- exact_extract(spei1, zwe_lzh, 'mean')
spei_LHZ <- as.data.frame(t(as.matrix(spei_LHZ)), col.names =as.character(zwe_lzh$FNID)  )
names(spei_LHZ)<-as.character(zwe_lzh$FNID)
spei_LHZ<-spei_LHZ %>% mutate(ID=rownames(spei_LHZ)) %>% mutate(ID=gsub("[.]", "/", substr(ID, 7, 16))) %>% mutate(date=as_date(ID)) %>% filter(date >= as.Date("1980/01/01"))
rownames(spei_LHZ) <-spei_LHZ$date 
spei_LHZ %>% dplyr::select(ZW2011L102)

rect_data <- data.frame(xmin=as.Date("1980/01/01"),
                        xmax=max(spei_LHZ$date),
                        ymin=c(-4,-2,-1),
                        ymax=c(-2,-1,0),
                        col=c("#de2d26","#fc9272","#fee0d2"))

scatwinddam<-ggplot() +
  geom_line(data=spei_LHZ %>% dplyr::select(ZW2011L102,date), aes(x=date, y=ZW2011L102), color = "blue",size=.5)+
  geom_hline(yintercept=-2, linetype="dashed", color = "red",size=1) +
  geom_hline(yintercept=0, linetype="dashed", color = "black",size=.1) +
  geom_hline(yintercept=-1.0, linetype="dashed", color = "orange",size=1) +
  geom_vline(xintercept = as.Date("1992/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2002/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2003/01/01"),color='#f03b20',size=.3) + 
  geom_vline(xintercept = as.Date("2005/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2008/01/01"),color='#f03b20',size=.3) + 
  geom_vline(xintercept = as.Date("2009/01/01"),color='#f03b20',size=.3) +
  scale_x_date(name="time",date_breaks="24 months")+
  #scale_x_date(name="time") + 
  scale_y_continuous(name="SPEI 1")+ 
  geom_rect(data=rect_data, aes(xmin=xmin,xmax=xmax,ymin=ymin,ymax=ymax,fill=col),alpha=0.2)+
  scale_fill_identity()+
  coord_cartesian(ylim=c(-4.0,3.5)) +
  ggtitle('SPEI 1 for (ZW02) + Impact baseline crop yield data for Zimbabwe')+
  theme(text = element_text(size=15),
        axis.text.x = element_text( size = 9, angle = 90,hjust = 1),
        axis.text.y = element_text( size = 10, angle = 0),
        plot.title=element_text(size=18),
        plot.background = element_rect(fill = "transparent",colour = NA))


ggsave(filename=paste0("D:/Drought_IBF/zwe/SPEI/",'SPEI_ZW2011L102.png'),plot=scatwinddam, width = 30, height = 20, units = "cm")

#################SPEI-3###############################


spei3 <- brick("D:/Drought_IBF/general_data/spei03.nc")
spei_LHZ <- exact_extract(spei3, zwe_lzh, 'mean')
spei_LHZ <- as.data.frame(t(as.matrix(spei_LHZ)), col.names =as.character(zwe_lzh$FNID)  )
names(spei_LHZ)<-as.character(zwe_lzh$FNID)
spei_LHZ<-spei_LHZ %>% mutate(ID=rownames(spei_LHZ)) %>% mutate(ID=gsub("[.]", "/", substr(ID, 7, 16))) %>% mutate(date=as_date(ID)) %>% filter(date >= as.Date("1980/01/01"))
rownames(spei_LHZ) <-spei_LHZ$date 
spei_LHZ %>% dplyr::select(ZW2011L102)


spei3 <- brick("D:/Drought_IBF/general_data/spei03.nc")
spei_LHZ <- exact_extract(spei3, zwe_lzh, 'mean')
spei_LHZ <- as.data.frame(t(as.matrix(spei_LHZ)), col.names =as.character(zwe_lzh$FNID)  )
names(spei_LHZ)<-as.character(zwe_lzh$FNID)
spei_LHZ<-spei_LHZ %>% mutate(ID=rownames(spei_LHZ)) %>% mutate(ID=gsub("[.]", "/", substr(ID, 7, 16))) %>% mutate(date=as_date(ID)) %>% filter(date >= as.Date("1980/01/01"))
rownames(spei_LHZ) <-spei_LHZ$date 
spei_LHZ %>% dplyr::select(ZW2011L102)

rect_data <- data.frame(xmin=as.Date("1980/01/01"),
                        xmax=max(spei_LHZ$date),
                        ymin=c(-4,-2,-1),
                        ymax=c(-2,-1,0),
                        col=c("#de2d26","#fc9272","#fee0d2"))

scatwinddam<-ggplot() +
  geom_line(data=spei_LHZ %>% dplyr::select(ZW2011L102,date), aes(x=date, y=ZW2011L102), color = "blue",size=.5)+
  geom_hline(yintercept=-2, linetype="dashed", color = "red",size=1) +
  geom_hline(yintercept=0, linetype="dashed", color = "black",size=.1) +
  geom_hline(yintercept=-1.0, linetype="dashed", color = "orange",size=1) +
  geom_vline(xintercept = as.Date("1992/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2002/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2003/01/01"),color='#f03b20',size=.3) + 
  geom_vline(xintercept = as.Date("2005/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2008/01/01"),color='#f03b20',size=.3) + 
  geom_vline(xintercept = as.Date("2009/01/01"),color='#f03b20',size=.3) +
  scale_x_date(name="time",date_breaks="24 months")+
  #scale_x_date(name="time") + 
  scale_y_continuous(name="SPEI 1")+ 
  geom_rect(data=rect_data, aes(xmin=xmin,xmax=xmax,ymin=ymin,ymax=ymax,fill=col),alpha=0.2)+
  scale_fill_identity()+
  coord_cartesian(ylim=c(-4.0,3.5)) +
  ggtitle('SPEI 3 for (ZW02) + Impact baseline crop yield data for Zimbabwe')+
  theme(text = element_text(size=15),
        axis.text.x = element_text( size = 9, angle = 90,hjust = 1),
        axis.text.y = element_text( size = 10, angle = 0),
        plot.title=element_text(size=18),
        plot.background = element_rect(fill = "transparent",colour = NA))


ggsave(filename=paste0("D:/Drought_IBF/zwe/SPEI/",'SPEI3_ZW2011L102.png'),plot=scatwinddam, width = 30, height = 20, units = "cm")


###################SPEI-6#############################


spei6 <- brick("D:/Drought_IBF/general_data/spei06.nc")
spei_LHZ <- exact_extract(spei6, zwe_lzh, 'mean')
spei_LHZ <- as.data.frame(t(as.matrix(spei_LHZ)), col.names =as.character(zwe_lzh$FNID)  )
names(spei_LHZ)<-as.character(zwe_lzh$FNID)
spei_LHZ<-spei_LHZ %>% mutate(ID=rownames(spei_LHZ)) %>% mutate(ID=gsub("[.]", "/", substr(ID, 7, 16))) %>% mutate(date=as_date(ID)) %>% filter(date >= as.Date("1980/01/01"))
rownames(spei_LHZ) <-spei_LHZ$date 
spei_LHZ %>% dplyr::select(ZW2011L102)

## SPEI Average ##


rect_data <- data.frame(xmin=as.Date("1980/01/01"),
                        xmax=max(spei_LHZ$date),
                        ymin=c(-4,-2,-1),
                        ymax=c(-2,-1,0),
                        col=c("#de2d26","#fc9272","#fee0d2"))

scatwinddam<-ggplot() +
  geom_line(data=spei_LHZ %>% dplyr::select(ZW2011L102,date), aes(x=date, y=ZW2011L102), color = "blue",size=.5)+
  geom_hline(yintercept=-2, linetype="dashed", color = "red",size=1) +
  geom_hline(yintercept=0, linetype="dashed", color = "black",size=.1) +
  geom_hline(yintercept=-1.0, linetype="dashed", color = "orange",size=1) +
  geom_vline(xintercept = as.Date("1992/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2002/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2003/01/01"),color='#f03b20',size=.3) + 
  geom_vline(xintercept = as.Date("2005/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2008/01/01"),color='#f03b20',size=.3) + 
  geom_vline(xintercept = as.Date("2009/01/01"),color='#f03b20',size=.3) +
  scale_x_date(name="time",date_breaks="24 months")+
  #scale_x_date(name="time") + 
  scale_y_continuous(name="SPEI 6")+ 
  geom_rect(data=rect_data, aes(xmin=xmin,xmax=xmax,ymin=ymin,ymax=ymax,fill=col),alpha=0.2)+
  scale_fill_identity()+
  coord_cartesian(ylim=c(-4.0,3.5)) +
  ggtitle('SPEI 6 for (ZW02) + Impact baseline crop yield data for Zimbabwe')+
  theme(text = element_text(size=15),
        axis.text.x = element_text( size = 9, angle = 90,hjust = 1),
        axis.text.y = element_text( size = 10, angle = 0),
        plot.title=element_text(size=18),
        plot.background = element_rect(fill = "transparent",colour = NA))


ggsave(filename=paste0("D:/Drought_IBF/zwe/SPEI",'SPEI6_ZW2011L102.png'),plot=scatwinddam, width = 30, height = 20, units = "cm")


##################SPEI-12##############################


spei12 <- brick("D:/Drought_IBF/general_data/spei12.nc")
spei_LHZ <- exact_extract(spei12, zwe_lzh, 'mean')
spei_LHZ <- as.data.frame(t(as.matrix(spei_LHZ)), col.names =as.character(zwe_lzh$FNID)  )
names(spei_LHZ)<-as.character(zwe_lzh$FNID)
spei_LHZ<-spei_LHZ %>% mutate(ID=rownames(spei_LHZ)) %>% mutate(ID=gsub("[.]", "/", substr(ID, 7, 16))) %>% mutate(date=as_date(ID)) %>% filter(date >= as.Date("1980/01/01"))
rownames(spei_LHZ) <-spei_LHZ$date 
spei_LHZ %>% dplyr::select(ZW2011L102)

rect_data <- data.frame(xmin=as.Date("1980/01/01"),
                        xmax=max(spei_LHZ$date),
                        ymin=c(-4,-2,-1),
                        ymax=c(-2,-1,0),
                        col=c("#de2d26","#fc9272","#fee0d2"))

scatwinddam <- ggplot() + geom_line(aes(x=date, y=FNID), color = "black",size=.5)+
  geom_hline(yintercept=-2, linetype="dashed", color = "red",size=1) +
  geom_hline(yintercept=0, linetype="dashed", color = "black",size=.1) +
  geom_hline(yintercept=-1.0, linetype="dashed", color = "orange",size=1) +
  geom_vline(xintercept = as.Date("1992/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2002/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2003/01/01"),color='#f03b20',size=.3) + 
  geom_vline(xintercept = as.Date("2005/01/01"),color='#f03b20',size=.3) +
  geom_vline(xintercept = as.Date("2008/01/01"),color='#f03b20',size=.3) + 
  geom_vline(xintercept = as.Date("2009/01/01"),color='#f03b20',size=.3) +
  scale_x_date(name="time",date_breaks="24 months")+
  #scale_x_date(name="time") + 
  scale_y_continuous(name="SPEI 12")+ 
  geom_rect(data=rect_data, aes(xmin=xmin,xmax=xmax,ymin=ymin,ymax=ymax,fill=col),alpha=0.2)+
  scale_fill_identity()+
  coord_cartesian(ylim=c(-4.0,3.5)) +
  ggtitle('SPEI 12 for (ZW02) + Impact baseline crop yield data for Zimbabwe')+
  theme(text = element_text(size=15),
        axis.text.x = element_text( size = 9, angle = 90,hjust = 1),
        axis.text.y = element_text( size = 10, angle = 0),
        plot.title=element_text(size=18),
        plot.background = element_rect(fill = "transparent",colour = NA))


ggsave(filename=paste0("D:/Drought_IBF/zwe/SPEI/",'SPEI12_ZW02.png'),plot=scatwinddam, width = 30, height = 20, units = "cm")


##################################################
############ ANOMALY CROP YIELD DATA ############# 
##################################################


## Crop Yield Maize Anomaly ##
df <-read.csv(file ="D:/Drought_IBF/dmp_vci_analysis/results/all_yield.csv" )

# mean value over all years grouped by pcode
ref <- aggregate(yield ~ ?..pcode, df, mean)

#calculute the standard deviation over all years grouped by pcode
std <- aggregate(yield ~ ?..pcode, df, sd)

#combine of the two columns (mean and std)
ref <- left_join(ref, std, by='?..pcode')

df <- left_join(df, ref, by = '?..pcode')

names(df) <- c("pcode", "year", "yield", "mean", "std")

# Calculate anomaly crop yield data
df <- df %>% rowwise() %>% mutate(anomaly = (yield - mean) / std)

#Plot tables where drought occurs (binary 0 no drought year, 1 drought year)
df %>% filter(anomaly < -1) %>% dplyr::select(year, pcode) %>% table()
df %>% filter(anomaly < -1.5) %>% dplyr::select(year, pcode) %>% table()
df %>% filter(anomaly < -2) %>% dplyr::select(year, pcode) %>% table()

for (x in df$pcode %>% unique()) {
p <- df %>% filter(pcode == x) %>%  ggplot() + geom_line(aes(x = year, y = anomaly)) +
  geom_hline(yintercept=-2, linetype="dashed", color = "red",size=1) +
  geom_hline(yintercept=-1, linetype="dashed", color = "blue",size=.5) + 
  geom_hline(yintercept=0, linetype="dashed", color = "black",size=.1)+ 
  scale_x_date(name="year")+
  #scale_x_date(name="time") + 
  scale_y_continuous(name="Standardized Anomaly Crop Yield")+ 
  geom_rect(data=rect_data, aes(xmin=xmin,xmax=xmax,ymin=ymin,ymax=ymax,fill=col),alpha=0.2)+
  scale_fill_identity()+
  coord_cartesian(ylim=c(-4.0,3.5)) +
  ggtitle('Crop Yield Standardized Anomaly (%s)')+
  theme(text = element_text(size=15),
        axis.text.x = element_text( size = 9, angle = 90,hjust = 1),
        axis.text.y = element_text( size = 10, angle = 0),
        plot.title=element_text(size=18),
        plot.background = element_rect(fill = "transparent",colour = NA))


ggsave(filename=sprintf("D:/Drought_IBF/zwe/Anomaly_%s.png", x),plot=p, width = 30, height = 20, units = "cm")
}


# df %>% filter(pcode == "ZW08")  #Check values for a specific pcode

