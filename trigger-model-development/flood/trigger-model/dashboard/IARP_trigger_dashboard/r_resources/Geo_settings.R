crs1 <- "+proj=longlat +datum=WGS84 +no_defs +ellps=WGS84 +towgs84=0,0,0" 
url_geonode <- "https://geonode.510.global/geoserver/geonode/ows"

country_settings <- list(
  "uganda" = list("admin2"="geonode:uga_adminboundaries_2"),
  "Ethiopia" = list("admin3"="geonode:eth_adminboundaries_3"),
  "kenya" = list( "admin1"="geonode:ken_adminboundaries_1")
)


