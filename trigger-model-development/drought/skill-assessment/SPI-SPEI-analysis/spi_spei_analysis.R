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
library(cowplot)
library(stringr)

##################################################
################### Load inputs ##################
##################################################
onedrive_folder <- "c:/Users/BOttow/Rode Kruis"
zwe_lzh <- st_read('c:/Users/BOttow/Documents/IPC/data/ZW_LHZ_2011/ZW_LHZ_2011.shp')
zwe <- st_read('c:/Users/BOttow/Documents/IPC/data/ZW_LHZ_2011/zwe_admbnda_adm0_zimstat_ocha_20180911.shp')

# name of standardised index (i.e: SPI3, SPEI6) for naming graphs and files
si_type = "SPEI12"
crop_type = "maize"

# set thresholds for the standardised index and crop yield anomaly
si_thr = -1
yield_anomaly_thr = -1

# load the standardised index file
si <- brick(sprintf("%s/510 - Data preparedness and IBF - [RD] Impact-based forecasting/General_Data/spi_spei/spei12.nc",
                    onedrive_folder))

# load all crop yield files and read as data.frame
yieldlist = list.files(path = sprintf("%s/510 - Data preparedness and IBF - [RD] Impact-based forecasting/IBF-  DROUGHT/crop_yield_data/maize/",
                                      onedrive_folder), pattern = "yield_", full.names=TRUE)
yield.df <- NULL
for (i in 1:length(yieldlist)) {
  c_yield <- brick(yieldlist[i])
  c_yield_LHZ <- exact_extract(c_yield, zwe_lzh, 'mean')    # extract by livelihood
  c_yield_LHZ <- as.data.frame(t(as.matrix(c_yield_LHZ)), col.names=as.character(zwe_lzh$FNID))
  names(c_yield_LHZ)<-as.character(zwe_lzh$FNID)            # name column as livelihood zone
  rownames(c_yield_LHZ) <- str_sub(yieldlist[i], -8, -5)    # name row as year
  rbind(yield.df, c_yield_LHZ) -> yield.df                  # append to the large df
}
yield.df <- yield.df[complete.cases(yield.df), ]  # remove NA

### output folder
output_folder <- paste(getwd(), "output", sep="/")

##################################################
########## Function to calculate skills ##########
##################################################
skill_analysis <- function(si_type, si, si_thr, crop_type, yield.df, yield_anomaly_thr, 
                           countryshape, livelyzoneshape, output_folder) {
  
  # calculate crop yield anomaly
  yield.df_long <- gather(yield.df, factor_key=TRUE)
  mean_sd <- yield.df_long %>% 
    group_by(key) %>% 
    summarise(mean= mean(value), sd= sd(value)) # calculate mean and standard deviation along the year axis
  yield_anomaly <- yield.df
  for (i in names(yield.df)) {                  # calculate crop yield anomaly per livelyhoodzone
    sd = sd(yield.df[,i])
    mean = mean(yield.df[,i])
    yield_anomaly[,i] = (yield.df[,i]-mean)/sd
  }
  yield_anomaly <- yield_anomaly %>%
    mutate(year=rownames(yield_anomaly)) 
  rownames(yield_anomaly) <- yield_anomaly$year
  yield_anomaly$year <- as.Date(yield_anomaly$year, format="%Y")
  yield_anomaly_subset <- yield_anomaly[year(yield_anomaly$year) %in% c(1983:2012),] # subset yield to 1983-2012
  
  # process SPI
  si_LHZ <- exact_extract(si, livelyzoneshape, 'mean')     # extract by livelihood
  si_LHZ <- as.data.frame(t(as.matrix(si_LHZ)), col.names =as.character(livelyzoneshape$FNID))
  names(si_LHZ) <- as.character(zwe_lzh$FNID)
  si_LHZ <- si_LHZ %>%                                    # organise, name the table rows
    mutate(ID=rownames(si_LHZ)) %>% 
    mutate(ID=gsub("[.]", "/", substr(ID, 7, 16))) %>% 
    mutate(date=as_date(ID)) 
  si_LHZ <- si_LHZ %>% 
    mutate(year=format(si_LHZ$date, "%Y")) %>% 
    mutate(month=format(si_LHZ$date, "%m"))
  rownames(si_LHZ) <- si_LHZ$date
  si_LHZ_subset <- si_LHZ[year(si_LHZ$date) %in% c(1983:2012) &   # subset yield to 1983-2012
                            month(si_LHZ$date) %in% c(1:3),]  # subset Jan, Feb, Mar from 1983-2012
  
  
  # create a dataframe with binary of SPI<threshold and crop anomaly per lz
  # calculate FAR, POD per lz
  scores.df <- NULL
  for (i in colnames(subset(si_LHZ_subset, select=-c(ID,date,year,month)))) {
    si_LHZ_filtered <- si_LHZ_subset[,c(i,"date","year","month")] # subset per lilelihood
    colnames(si_LHZ_filtered)[1] <- "sd_index"
    
    yield_anomaly_filtered <- as.data.frame(yield_anomaly[,c(i,"year")]) # subset per lilelihood
    rownames(yield_anomaly_filtered) <- rownames(yield_anomaly)
    colnames(yield_anomaly_filtered)[1] <- "yield"
    
    # plot standardised index with yield anomaly
    rect_data <- data.frame(xmin=min(yield_anomaly_filtered$year),
                            xmax=max(yield_anomaly_filtered$year),
                            ymin=c(-4,-2,-1),
                            ymax=c(-2,-1,0),
                            col=c("#de2d26","#fc9272","#fee0d2"))
    scatwinddam <- ggplot() +
      geom_line(data=si_LHZ_filtered, aes(x=date, y=sd_index), color="blue", size=.5) +
      geom_line(data=yield_anomaly_filtered, aes(x=year, y=yield), color="brown", size=.5) +
      scale_x_date(name="Time",date_breaks="24 months")+
      scale_y_continuous(name=paste(si_type, "and", crop_type))+ 
      geom_rect(data=rect_data, aes(xmin=xmin,xmax=xmax,ymin=ymin,ymax=ymax,fill=col), alpha=0.2) +
      scale_fill_identity() +
      scale_color_discrete(labels = c(si_type, crop_type)) +
      coord_cartesian(ylim=c(-4.0,3.5)) +
      ggtitle(paste(si_type, 'and', crop_type, 'yield anomaly data for', i)) +
      theme(text = element_text(size=15),
            axis.text.x = element_text( size = 9, angle = 90, hjust = 1),
            axis.text.y = element_text( size = 10, angle = 0),
            legend.position = c(0.8, 0.2),
            plot.title = element_text(size=18),
            plot.background = element_rect(fill = "transparent",colour = NA)) 
    dir.create(paste0(output_folder, "/per_lzone"))
    ggsave(filename=paste0(output_folder,"/per_lzone/",si_type, "_", crop_type, "_", i, '.png'), 
           plot=scatwinddam, width = 30, height = 20, units = "cm")
    
    # check if standardised index and yield anomaly cross thresholds
    si_LHZ_filtered <- si_LHZ_filtered %>%    # take min value among the 3 months of the year
      group_by(year) %>%
      summarise(min=min(sd_index))
    si_LHZ_filtered <- si_LHZ_filtered %>%
      mutate(drought = ifelse(min>si_thr, 0, 1))  # binary logic if the index is higher than the threshold: 0, else 1
    rownames(si_LHZ_filtered) <- si_LHZ_filtered$year
    
    x <- rownames(yield_anomaly_filtered)
    yield_anomaly_filtered <- yield_anomaly_filtered %>%
      mutate(anomaly=ifelse(yield > yield_anomaly_thr, 0, 1)) # binary logic if the index is higher than the threshold: 0, else 1
    rownames(yield_anomaly_filtered) <- x
    
    # calculate the scores
    scores <- merge(si_LHZ_filtered, yield_anomaly_filtered, by=0) %>%
      mutate(
        hit = drought & anomaly,                     # hit when it's drought and crop loss
        false_alarm = (drought==1) & (anomaly==0),   # false alarm when it's drought but not crop loss
        missed = (drought==0) & (anomaly==1),        # missed when it's not drought but crop loss
        cor_neg = (drought==0) & (anomaly==0)        
      ) %>%
      summarise(
        hits = sum(hit),
        false_alarms = sum(false_alarm),
        POD = hits/(hits+sum(missed)),
        FAR = false_alarms/(hits+false_alarms)
      )
    rownames(scores) <- paste(i)
    rbind(scores.df, scores) -> scores.df           # merge all livelihood into data.frame
  }
  return(scores.df)
}

# usage: use the correct order of syntax
# skill_analysis(si_type, si, si_thr, crop_type, yield.df, yield_anomaly_thr, countryshape, livelyzoneshape)
# where: si_type: standardised index type (string)
        # si: loaded nc file of the standardised index
        # si_thr: the standardised index threshold (single value)
        # crop_type: crop yield type (string)
        # yield.df, data.frame of the crop yield
        # yield_anomaly_thr: crop yield anomaly (single value)
        # countryshape: shapefile of country (for cropping global dataset with country extent)
        # livelyzoneshape: shapefile of livelihood zones (for calculation)
        # output_folder: folder where to save the output

##################################################
######### Run function and save outputs ##########
##################################################

scores.df <- skill_analysis(si_type, si, si_thr, crop_type, yield.df, yield_anomaly_thr, zwe, 
                            zwe_lzh, output_folder)

# export csv and shapefile of the scores
write.csv(scores.df,
          paste0(output_folder, si_type, "_", crop_type, "_scores_summary.csv"))
zwe_scores = merge(zwe_lzh, scores.df, by.x="FNID", by.y=0)
st_write(zwe_scores,
         paste0("C:/Users/pphung/Desktop/zwe_spi/out/shape/", si_type, "_", crop_type, "_zwe_scores.shp"), append=FALSE)

# plot all scores in shapefile
pod = ggplot() + 
  geom_sf(data = zwe_scores, aes(fill = POD), # fill by POD
          colour = "black", size = 0.5) + 
  scale_fill_gradient(limits = c(0,1), low = "red", high = "white") +
  theme(legend.position="bottom") +
  ggtitle("POD")
far = ggplot() + 
  geom_sf(data = zwe_scores, aes(fill = FAR), # fill by POD
          colour = "black", size = 0.5) + 
  scale_fill_gradient(limits = c(0,1), low = "white", high = "red") +
  theme(legend.position="bottom") +
  ggtitle("FAR")
pod_far <- plot_grid(pod, far)
title <- ggdraw() +
  draw_label(paste("Scores", si_type, "vs", crop_type, "for Zimbabwe"), fontface='bold')
fig <- plot_grid(title, pod_far, ncol=1, rel_heights=c(0.1, 1))
ggsave(filename=paste0("C:/Users/pphung/Desktop/zwe_spi/out/", si_type, "_", crop_type, '_zwe_scores.png'), plot=fig, width = 30, height = 20, units = "cm")

