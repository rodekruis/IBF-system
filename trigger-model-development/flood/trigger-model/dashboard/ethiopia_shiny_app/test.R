
selected_pcode <- "020104"
selected_station <- "G1045"
selected_lowdate <- "2000-07-19"
selected_highdate <- "2018-04-05"
rainfall_threshold <- 2
glofas_threshold <- 864

glofas <-glofas_raw %>%
    filter(station == selected_station) %>%
    filter(date >= selected_lowdate, date <= selected_highdate)

rainfall <- rainfall_raw %>%
    filter(
      pcode == selected_pcode,
      date >= selected_lowdate,
      date <= selected_highdate)

impact_df <- df_impact_raw %>%
    filter(pcode == selected_pcode,
           date >= selected_lowdate,
           date <= selected_highdate)

plot_rainfall_glofas(rainfall, glofas, impact_df, rainfall_threshold, glofas_threshold, TRUE)
predict_with_glofas_and_rainfall(all_days, rainfall, glofas, impact_df, rainfall_threshold, glofas_threshold, TRUE)

glofas %>%
  left_join(rainfall, by = "date") %>%
  left_join(impact_df %>% dplyr::select(date) %>% mutate(flood = TRUE), by = "date") %>%
  mutate(
    flood = replace_na(flood, FALSE),
    rainfall_exceeds_threshold = rainfall >= rainfall_threshold,
    glofas_exceeds_threshold = dis >= glofas_threshold,
    both_exceed_threshold = rainfall_exceeds_threshold & glofas_exceeds_threshold,
    flood_correct = flood & both_exceed_threshold,
    next_exceeds_threshold = lag(both_exceed_threshold),
    peak_start = !both_exceed_threshold & next_exceeds_threshold
  ) %>%
  summarise(
    floods = sum(flood),
    floods_correct = sum(flood_correct),
    floods_incorrect = floods - floods_correct,
    protocol_triggered = sum(peak_start, na.rm=T),
    triggered_in_vain = protocol_triggered - floods_correct,
    triggered_correct = floods_correct,
    detection_ratio = round(floods_correct / floods, 2),
    false_alarm_ratio = round(triggered_in_vain/protocol_triggered, 2)
  )
