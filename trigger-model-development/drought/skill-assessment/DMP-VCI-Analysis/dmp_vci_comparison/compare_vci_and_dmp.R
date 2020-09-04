library(tidyverse)
library(lubridate)
library(sf)

dmp <- read.csv('results/all_dmp.csv')
vci <- read.csv('VCI_values.csv')

kenya_admin1 <- st_read("admin_shapes/KEN_adm1_mapshaper_corrected.shp")

kenya_pcodes <- tibble(
  pcode = as.character(kenya_admin1$pcode_le_1),
  county = as.character(kenya_admin1$name)
)

dmp <- dmp %>%
  mutate(
    pcode = as.character(pcode),
    date = as_date(date)
  ) %>%
  left_join(kenya_pcodes, by = "pcode")

vci <- vci %>%
  rename(county = County, date = Dates) %>%
  mutate(
    county = as.character(county),
    date = as_date(date)
  )

dmp %>%
  left_join(vci, by = c("county", "date")) %>%
  filter(!is.na(VCI1W)) %>%
  dplyr::select(-pcode) %>%
  gather(var, val, -date, -county) %>%
  arrange(county, date) %>%
  ggplot(aes(x=date, y=val, col=var)) +
  geom_line()+
  facet_wrap(~county) + ggtitle("VCI vs DMP") +
  theme(axis.text.x = element_text(angle=90))


vci3m_pred_kitui <- read.csv("all_vci3m_Kitui_pred.csv")

# Visual accuracy of 1 week ahead forcast
vci3m_pred_kitui %>%
  mutate(date = as_date(date)) %>%
  group_by(date) %>%
  arrange(loop_num) %>%
  slice(1) %>%  # Several predictions for each date because of rolling horizon, this takes the first one, you could also check further ones
  dplyr::select(-loop_num) %>%
  left_join(vci %>% filter(county == "Kitui")) %>%
  dplyr::select(date, VCI3M, VCI3MPRED) %>%
  gather(var, val, -date) %>%
  ggplot(aes(x=date, y=val, col=var)) + geom_line() + ggtitle("1 weeks ahead VCI prediction versus real VCI")

# Visual accuracy of 10 week ahead forcast
vci3m_pred_kitui %>%
  mutate(date = as_date(date)) %>%
  group_by(date) %>%
  arrange(-loop_num) %>%
  slice(1) %>%  # Several predictions for each date because of rolling horizon, this takes the first one, you could also check further ones
  dplyr::select(-loop_num) %>%
  left_join(vci %>% filter(county == "Kitui")) %>%
  dplyr::select(date, VCI3M, VCI3MPRED) %>%
  gather(var, val, -date) %>%
  ggplot(aes(x=date, y=val, col=var)) + geom_line() + ggtitle("10 weeks ahead VCI prediction versus real VCI")
