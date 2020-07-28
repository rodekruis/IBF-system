library(ncdf4)
library(raster)
library(lubridate)
nc <- nc_open("c:/Users/BOttow/OneDrive - Rode Kruis/Documenten/IBF/Rainfall/WRF_ICPAC_1980-2010_daily.nc")

# 1 januari 1980

get_date_as_raster <- function(nc, date) {
  y <- nc$var$prec$dim[[2]]$vals
  x <- nc$var$prec$dim[[1]]$vals
  time <- dmy("01-01-1980") + nc$var$prec$dim[[3]]$vals
  data <- ncvar_get(nc = nc, varid = "prec", start = c(1,1,which(time == date + 0.25)), count = c(326,328,1))
  raster(nrows = nrow(data), ncols = ncol(data),
         xmn = min(x), xmx = max(x), ymn = min(y), ymx = max(y),
         crs = "+proj=longlat +datum=WGS84", vals=data)
}


# library(plotKML)
# plotKML(r)

uga_admin <- sf::read_sf("c:/Users/BOttow/Documents/IBF-system/trigger-model-development/flood/trigger-model/dashboard/IARP_trigger_dashboard/shapes/uga_adminboundaries_1.shp")
ken_admin <- sf::read_sf("c:/Users/BOttow/Documents/IBF-system/trigger-model-development/flood/trigger-model/dashboard/IARP_trigger_dashboard/shapes/ken_adminboundaries_1.shp")

df <- data.frame(matrix(ncol=nrow(ken_admin)+1, nrow=0))
names(df) <- c("time",ken_admin$ADM1_EN)
date <- dmy("01-01-2000")
for (i in 0:4500){
  d <- date + i
  cat(sprintf("date: %s\n", d))
  r <- get_date_as_raster(nc, d)
  df[nrow(df)+1,2:ncol(df)] <- extract(r, ken_admin, fun = max)
  df[nrow(df),1] <- format(d, format = "%d-%m-%Y")
}

write.csv(df, "c:/Users/BOttow/Documents/IBF-system/trigger-model-development/flood/trigger-model/dashboard/IARP_trigger_dashboard/data/WRF_kenya_2000-2010.csv",
          row.names = F)
