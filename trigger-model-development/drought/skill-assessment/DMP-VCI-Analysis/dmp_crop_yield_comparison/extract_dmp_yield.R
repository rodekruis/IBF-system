library(raster)
library(sf)
library(tidyverse)
library(velox)
library(stringr)
library(lubridate)
# Download velox from https://cran.r-project.org/src/contrib/Archive/velox/
# Make sure you have and updated version of Rtools (https://cran.r-project.org/bin/windows/Rtools/) and R
# pkgbuild::has_rtools() # helps to check if rtools is correctly installed
install.packages("c:/Users/BOttow/Downloads/velox_0.2.0.tar.gz", repos = NULL, type="source")


setwd('c:/Users/BOttow/Documents/IBF-system/trigger-model-development/drought/skill-assessment/DMP-VCI-Analysis/dmp_crop_yield_comparison')

# Because velox$extract() does not take extra arguments we have to write a custom mean no na function
mean_no_na <- function(x) {
  mean(x, na.rm=T)
}


crs1 <- "+proj=longlat +datum=WGS84 +no_defs +ellps=WGS84 +towgs84=0,0,0"
new_extent <- extent(33, 47, 3.5, 14.5)

maiz_dir="C:/Users/ATeklesadik/OneDrive - Rode Kruis/Documents/documents/IBF-system/trigger-model-development/drought/skill-assessment/DMP-VCI-Analysis/dmp_vci_comparison/Iizumi_Toshichika/maize"
setwd(maiz_dir)

#raster_folders <- setdiff(list.dirs("DMP/", full.names=F), "")
raster_fILES_maize <-list.files(path = "Iizumi_Toshichika/maize", pattern = '.nc', all.files = FALSE,
                                full.names = FALSE, recursive = TRUE, include.dirs = FALSE)
DMP_fILES <-list.files(path = "DMP/", pattern ="*.nc|*.tiff", all.files = FALSE,
                       full.names = FALSE, recursive = TRUE, include.dirs = FALSE)
DMP_files<-DMP_fILES[!str_detect(DMP_fILES,pattern="_QL_")]  #remove quality flag files

Maiz_rasters_ <- stack(raster_fILES_maize)
Maize_raster_ <- calc(Maiz_rasters_, fun = max)


setwd('C:\\Users\\ATeklesadik\\OneDrive - Rode Kruis\\Documents\\documents\\IBF-system\\trigger-model-development\\drought\\skill-assessment\\DMP-VCI-Analysis\\dmp_vci_comparison')



clip<-function(raster,shape) {
  raster_crop<-crop(raster,shape)## masking to basin box
  raster_bsn<-mask(raster_crop,shape) # to bsn boundary only
  return (raster_bsn)}

Eth_LZH <- st_read("admin_shapes/ET_LHZ_2018/ET_LHZ_2018.shp")


dmp_dfs <- list()
yield_dfs<-list()

#######################
for (raster_file in raster_fILES_maize) {
  print(paste0("Calculating raster ", raster_file, " time ", Sys.time()))
  filename <- paste0("Iizumi_Toshichika/maize/", raster_file)
  raster_folder<-strsplit(strsplit(raster_file, "/")[[1]][1], "_")[[1]][2]

  MAIZE_raster <- raster(filename)

  yield_velox <- velox(MAIZE_raster)

  yield_values <- yield_velox$extract(Eth_LZH, fun=mean_no_na)
  raster_date <- str_sub(raster_folder, 1, 4)
  yield_df <- tibble(pcode = Eth_LZH$LZCODE,    year = raster_date,    yield = yield_values)
  write.csv(yield_df, paste0("results/yield_", raster_date, ".csv"), row.names=F)
  yield_dfs[[raster_date]] <- yield_df
}
# Combining files
all_yield <- bind_rows(yield_dfs)
write.csv(all_yield, "results/all_yield.csv", row.names=F)

#######################

for (raster_file in DMP_files) {
  print(paste0("Calculating raster ", raster_file, " time ", Sys.time()))
  filename <- paste0("DMP/", raster_file)
  raster_folder<-strsplit(strsplit(raster_file, "/")[[1]][2], "_")[[1]][4]
  dmp_raster <- raster(filename)
  dmp_raster<-crop(dmp_raster,new_extent)
  Maize_raster.300 <- raster::resample(Maize_raster_,dmp_raster,  "bilinear")
  Maize_raster.300<-crop(Maize_raster.300,new_extent)
  Maize_raster.300[Maize_raster.300>0]<- 1 # this layer will be used to crop DMP data

  dmp_raster <- mask(dmp_raster, Maize_raster.300)
  dmp_velox <- velox(dmp_raster)
  dmp_values <- dmp_velox$extract(Eth_LZH, fun=mean_no_na)
  raster_date <- str_sub(raster_folder, 1, 8)

  dmp_df <- tibble(pcode = Eth_LZH$LZCODE,  date = as_date(raster_date),  dmp = dmp_values)

  write.csv(dmp_df, paste0("results/", raster_date, ".csv"), row.names=F)
  dmp_dfs[[raster_folder]] <- dmp_df

}

# Combining files
all_dmps <- bind_rows(dmp_dfs)
write.csv(all_dmps, "results/all_dmp.csv", row.names=F)


dmpdfs_dfs<-list()
#######################

csv_fILES_maize <-list.files(path = "results", pattern = '.csv', all.files = FALSE,
                                full.names = FALSE, recursive = TRUE, include.dirs = TRUE)


for (raster_file in csv_fILES_maize) {
  print(paste0("Calculating raster ", raster_file, " time ", Sys.time()))
  filename <- paste0("results/", raster_file)
  year_date <- str_sub(raster_file, 1, 4)
  month_date <- str_sub(raster_file, 4, 6)
  day_date <- str_sub(raster_file, 6, 8)
  dfcsv <- read_csv(filename)
  dmp_df <- tibble(pcode = dfcsv$pcode,date = as_date(raster_file),dmp = dfcsv$dmp)


  dmpdfs_dfs[[raster_date]] <- dmp_df
}




