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
# Maize global dataset, downloaded from here: https://doi.pangaea.de/10.1594/PANGAEA.909132
maize_dir <- "c:/Users/BOttow/OneDrive - Rode Kruis/Documenten/IBF/data/gdhy_v1.2_v1.3_20190128/maize"
# Copernicus Dry Matter Productivity dataset
dmp_dir <- "c:/Users/BOttow/Documents/RK_drought_monitor-master/temp/dmp_v2_1km"
lhz <- st_read("c:/Users/BOttow/OneDrive - Rode Kruis/Documenten/IBF/data/ZW_LHZ_2011/ZW_LHZ_2011.shp")
calculateMax = TRUE
# country extent
#new_extent <- extent(33, 47, 3.5, 14.5) # Ethiopia
new_extent <- extent(24, 34, -23, -15) # Zimbabwe

# Because velox$extract() does not take extra arguments we have to write a custom mean no na function
mean_no_na <- function(x) {
  mean(x, na.rm=T)
}
clip<-function(raster,shape) {
  raster_crop<-crop(raster,shape)## masking to basin box
  raster_bsn<-mask(raster_crop,shape) # to bsn boundary only
  return (raster_bsn)}
crs1 <- "+proj=longlat +datum=WGS84 +no_defs +ellps=WGS84 +towgs84=0,0,0"

#raster_folders <- setdiff(list.dirs("DMP/", full.names=F), "")
raster_files_maize <- list.files(path = maize_dir, pattern = '.nc', all.files = FALSE,
                                full.names = TRUE, recursive = TRUE, include.dirs = FALSE)
DMP_files <- list.files(path = dmp_dir, pattern ="*.nc|*.tiff", all.files = FALSE,
                       full.names = FALSE, recursive = TRUE, include.dirs = FALSE)
DMP_files <- DMP_files[!str_detect(DMP_files,pattern="_QL_")]  #remove quality flag files

if (calculateMax){
  maize_rasters <- stack(raster_files_maize)
  maize_rasters_max <- calc(maize_rasters, fun = max)
  plot(maize_rasters_max)
  plot(lhz, add=T)
}

yield_dfs<-list()
##### EXTRACTING MAIZE YIELD
for (raster_file in raster_files_maize) {
  print(paste0("Calculating raster ", raster_file, " time ", Sys.time()))
  file <- strsplit(raster_file, "/")[[1]]
  year <- substr(strsplit(file[length(file)], "_")[[1]][2],1,4)

  maize_raster <- raster(raster_file)

  yield_velox <- velox(maize_raster)

  yield_values <- yield_velox$extract(lhz, fun=mean_no_na)
  yield_df <- tibble(pcode = lhz$LZCODE,    year = year,    yield = yield_values)
  write.csv(yield_df, paste0("results/yield_", year, ".csv"), row.names=F)
  yield_dfs[[year]] <- yield_df
}
# Combining files
all_yield <- bind_rows(yield_dfs)
write.csv(all_yield, "results/all_yield.csv", row.names=F)

##### EXTRACTING DMP
dmp_dfs <- list()
for (raster_file in DMP_files) {
  print(paste0("Calculating raster ", raster_file, " time ", Sys.time()))
  filename <- paste(dmp_dir, raster_file, sep="/")
  raster_folder <- strsplit(raster_file, "_")[[1]][4]
  dmp_raster <- raster(filename)
  dmp_raster_cropped <- crop(dmp_raster,new_extent)
  Maize_raster.300 <- raster::resample(maize_rasters_max, dmp_raster_cropped,  "bilinear")
  Maize_raster.300 <- crop(Maize_raster.300, new_extent)
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




