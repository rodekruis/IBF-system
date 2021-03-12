crs1 <- "+proj=longlat +datum=WGS84 +no_defs +ellps=WGS84 +towgs84=0,0,0"
url_geonode <- "https://geonode.510.global/geoserver/geonode/wfs"

country_settings <- list(
  "ethiopia" = list("Ethiopia"="geonode:eth_admbnda_adm2_csa_bofed_20201008",
					"Ethiopia_lhz"="geonode:ET_LHZ_2018"),
  "kenya" = list("kenya_lhz"="geonode:KE_LHZ_2011",
				"kenya"="geonode:KEN_Adm2"),
  "SA_region" = list("SA_admin2_region"="geonode:SA_admin2_region",
					"Lesotho_lhz"="geonode:LS_LHZ_2011",
					"Mozambique_lhz"="geonode:MZ_LHZ_2013")
)
