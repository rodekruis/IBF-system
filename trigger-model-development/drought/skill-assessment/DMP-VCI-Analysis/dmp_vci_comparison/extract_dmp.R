library(raster)
library(sf)
library(tidyverse)
library(velox)
library(stringr)
library(lubridate)
# install.packages("velox_0.2.0.tar.gz", repos = NULL, type="source")

# Because velox$extract() does not take extra arguments we have to write a custom mean no na function
mean_no_na <- function(x) {
  mean(x, na.rm=T)
}


kenya_admin1 <- st_read("admin_shapes/KEN_adm1_mapshaper_corrected.shp")
raster_folders <- setdiff(list.dirs("all_dmp/", full.names=F), "")

dmp_dfs <- list()

for (raster_folder in raster_folders) {
  print(paste0("Calculating raster ", raster_folder, " time ", Sys.time()))

  if (length(grep("_RT", raster_folder)) != 0) {
    rt_type <- str_sub(raster_folder, 5, 7)
    filename <- paste0("all_dmp/", raster_folder, "/c_gls_DMP-", rt_type,"_QL_", str_replace(raster_folder, paste0("DMP_", rt_type, "_"), ""), ".tiff")
  } else {
    filename <- paste0("all_dmp/", raster_folder, "/c_gls_DMP_QL_", str_replace(raster_folder, "DMP_", ""), ".tiff")
  }
  dmp_raster <- raster(filename)
  dmp_velox <- velox(dmp_raster)
  dmp_values <- dmp_velox$extract(kenya_admin1, fun=mean_no_na)

  raster_date <- str_sub(raster_folder, 5, 12)
  dmp_df <- tibble(
    pcode = kenya_admin1$pcode_le_1,
    date = as_date(raster_date),
    dmp = dmp_values
  )

  write.csv(dmp_df, paste0("results/", raster_date, ".csv"), row.names=F)

  dmp_dfs[[raster_folder]] <- dmp_df
}

# Combining files
all_dmps <- bind_rows(dmp_dfs)
write.csv(all_dmps, "results/all_dmp.csv", row.names=F)
