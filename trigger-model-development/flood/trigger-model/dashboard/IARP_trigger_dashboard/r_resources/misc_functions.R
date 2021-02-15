
download.features.geonode <- function(country, elm) {
  url$query <- list(service = "WFS",version = "2.0.0",request = "GetFeature",
                    typename = eval(parse(text=paste("settings$",country,"$",elm,sep=""))),
                    outputFormat = "application/json")
  request <- build_url(url)
  st_read(request)
}
summarize_floods <- function(df) {
  df %>%
    group_by(admin, pcode) %>%
    summarise(
      n_floods = n()
    ) %>%
    arrange(-n_floods) %>%
    ungroup()
}